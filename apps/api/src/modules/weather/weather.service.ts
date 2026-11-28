import type { FastifyBaseLogger } from "fastify"
import type { Redis } from "ioredis"
import { getWeather } from "@weather-universe/weather-engine"
import { sharedRedis } from "../../plugins/redis-client.js"

const WEATHER_FRESH_TTL_SECONDS = 5 * 60
const WEATHER_STALE_TTL_SECONDS = 30 * 60
const MAX_LOCAL_CACHE_ENTRIES = 500

type Weather = Awaited<ReturnType<typeof getWeather>>
export type WeatherCacheStatus = "hit" | "miss" | "stale"

interface LocalWeatherEntry {
  weather: Weather
  freshUntil: number
  staleUntil: number
}

export interface WeatherCacheOptions {
  fetchWeather?: (latitude: number, longitude: number) => Promise<Weather>
  redis?: Pick<Redis, "status" | "mget" | "set"> | null
  now?: () => number
  freshTtlMs?: number
  staleTtlMs?: number
  maxLocalEntries?: number
}

function cacheKey(latitude: number, longitude: number) {
  // Weather grids have much lower spatial precision than four decimal places.
  return `weather:v1:${latitude.toFixed(4)}:${longitude.toFixed(4)}`
}

function parseWeather(value: string | null): Weather | null {
  if (!value) return null
  try {
    return JSON.parse(value) as Weather
  } catch {
    return null
  }
}

export function createWeatherCache(options: WeatherCacheOptions = {}) {
  const fetchWeather = options.fetchWeather ?? getWeather
  const redis = options.redis === undefined ? sharedRedis : options.redis
  const now = options.now ?? Date.now
  const freshTtlMs = options.freshTtlMs ?? WEATHER_FRESH_TTL_SECONDS * 1000
  const staleTtlMs = options.staleTtlMs ?? WEATHER_STALE_TTL_SECONDS * 1000
  const maxLocalEntries = options.maxLocalEntries ?? MAX_LOCAL_CACHE_ENTRIES
  const localCache = new Map<string, LocalWeatherEntry>()
  const inFlight = new Map<string, Promise<{ weather: Weather; cacheStatus: WeatherCacheStatus }>>()

  function saveLocal(key: string, weather: Weather, timestamp: number) {
    localCache.delete(key)
    localCache.set(key, {
      weather,
      freshUntil: timestamp + freshTtlMs,
      staleUntil: timestamp + staleTtlMs
    })

    while (localCache.size > maxLocalEntries) {
      const oldestKey = localCache.keys().next().value
      if (oldestKey === undefined) break
      localCache.delete(oldestKey)
    }
  }

  async function getCachedWeather(
    latitude: number,
    longitude: number,
    logger: FastifyBaseLogger
  ): Promise<{ weather: Weather; cacheStatus: WeatherCacheStatus }> {
    const key = cacheKey(latitude, longitude)
    const freshKey = `${key}:fresh`
    const staleKey = `${key}:stale`
    const timestamp = now()
    let staleWeather: Weather | null = null
    const localEntry = localCache.get(key)

    if (redis?.status === "ready") {
      try {
        const [freshValue, staleValue] = await redis.mget(freshKey, staleKey)
        const freshWeather = parseWeather(freshValue)
        if (freshWeather) return { weather: freshWeather, cacheStatus: "hit" }
        staleWeather = parseWeather(staleValue)
      } catch (error) {
        logger.warn({ err: error }, "Weather cache read failed; fetching from provider")
      }
    }

    if (localEntry && localEntry.staleUntil > timestamp) {
      if (localEntry.freshUntil > timestamp) {
        return { weather: localEntry.weather, cacheStatus: "hit" }
      }
      staleWeather ??= localEntry.weather
    }

    const pending = inFlight.get(key)
    if (pending) return pending

    const load = (async () => {
      try {
        const weather = await fetchWeather(latitude, longitude)
        saveLocal(key, weather, now())

        if (redis?.status === "ready") {
          const value = JSON.stringify(weather)
          const writes = await Promise.allSettled([
            redis.set(freshKey, value, "EX", WEATHER_FRESH_TTL_SECONDS),
            redis.set(staleKey, value, "EX", WEATHER_STALE_TTL_SECONDS)
          ])
          if (writes.some((result) => result.status === "rejected")) {
            logger.warn("Weather cache write failed")
          }
        }

        return { weather, cacheStatus: "miss" as const }
      } catch (error) {
        if (staleWeather) {
          logger.warn({ err: error }, "Weather provider failed; serving stale forecast")
          return { weather: staleWeather, cacheStatus: "stale" as const }
        }
        throw error
      }
    })()

    inFlight.set(key, load)
    try {
      return await load
    } finally {
      if (inFlight.get(key) === load) inFlight.delete(key)
    }
  }

  return { getCachedWeather }
}

const productionWeatherCache = createWeatherCache()

export const getCachedWeather = productionWeatherCache.getCachedWeather
