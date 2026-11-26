import type { FastifyBaseLogger } from "fastify"
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

const localCache = new Map<string, LocalWeatherEntry>()
const inFlight = new Map<string, Promise<{ weather: Weather; cacheStatus: WeatherCacheStatus }>>()

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

function saveLocal(key: string, weather: Weather, now: number) {
  localCache.delete(key)
  localCache.set(key, {
    weather,
    freshUntil: now + WEATHER_FRESH_TTL_SECONDS * 1000,
    staleUntil: now + WEATHER_STALE_TTL_SECONDS * 1000
  })

  while (localCache.size > MAX_LOCAL_CACHE_ENTRIES) {
    const oldestKey = localCache.keys().next().value
    if (oldestKey === undefined) break
    localCache.delete(oldestKey)
  }
}

export async function getCachedWeather(
  latitude: number,
  longitude: number,
  logger: FastifyBaseLogger
): Promise<{ weather: Weather; cacheStatus: WeatherCacheStatus }> {
  const key = cacheKey(latitude, longitude)
  const freshKey = `${key}:fresh`
  const staleKey = `${key}:stale`
  const now = Date.now()
  let staleWeather: Weather | null = null
  const localEntry = localCache.get(key)

  if (sharedRedis?.status === "ready") {
    try {
      const [freshValue, staleValue] = await sharedRedis.mget(freshKey, staleKey)
      const freshWeather = parseWeather(freshValue)
      if (freshWeather) {
        return { weather: freshWeather, cacheStatus: "hit" }
      }
      staleWeather = parseWeather(staleValue)
    } catch (error) {
      logger.warn({ err: error }, "Weather cache read failed; fetching from provider")
    }
  }

  if (localEntry && localEntry.staleUntil > now) {
    if (localEntry.freshUntil > now) {
      return { weather: localEntry.weather, cacheStatus: "hit" }
    }
    staleWeather ??= localEntry.weather
  }

  const pending = inFlight.get(key)
  if (pending) return pending

  const load = (async () => {
    try {
      const weather = await getWeather(latitude, longitude)
      saveLocal(key, weather, Date.now())

      if (sharedRedis?.status === "ready") {
        const value = JSON.stringify(weather)
        const writes = await Promise.allSettled([
          sharedRedis.set(freshKey, value, "EX", WEATHER_FRESH_TTL_SECONDS),
          sharedRedis.set(staleKey, value, "EX", WEATHER_STALE_TTL_SECONDS)
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
