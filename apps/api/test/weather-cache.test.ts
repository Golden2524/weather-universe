import test from "node:test"
import assert from "node:assert/strict"
import type { FastifyBaseLogger } from "fastify"
import type { Redis } from "ioredis"
import type { WeatherData } from "@weather-universe/types"
import { createWeatherCache } from "../src/modules/weather/weather.service.js"
import type { WeatherCacheOptions } from "../src/modules/weather/weather.service.js"

const weather: WeatherData = {
  location: { latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos" },
  current: { time: "2026-11-28T12:00", temperature: 29, feelsLike: 32, humidity: 75, precipitation: 0, weatherCode: 2, condition: "partly-cloudy", windSpeed: 9, windDirection: 180, cloudCover: 30 },
  hourly: [],
  daily: [],
  updatedAt: "2026-11-28T12:00:00.000Z"
}

const logger = { warn() {} } as unknown as FastifyBaseLogger

function options(fetchWeather: WeatherCacheOptions["fetchWeather"], overrides: Partial<WeatherCacheOptions> = {}): WeatherCacheOptions {
  return { fetchWeather, redis: null, ...overrides }
}

test("cache misses once then returns a fresh local hit", async () => {
  let calls = 0
  const cache = createWeatherCache(options(async () => { calls += 1; return weather }))

  const first = await cache.getCachedWeather(9.081, 7.491, logger)
  const second = await cache.getCachedWeather(9.081, 7.491, logger)

  assert.equal(first.cacheStatus, "miss")
  assert.equal(second.cacheStatus, "hit")
  assert.equal(calls, 1)
  assert.deepEqual(second.weather, weather)
})

test("concurrent requests for one location share the provider request", async () => {
  let calls = 0
  let release!: (value: WeatherData) => void
  const providerResponse = new Promise<WeatherData>((resolve) => { release = resolve })
  const cache = createWeatherCache(options(async () => { calls += 1; return providerResponse }))

  const first = cache.getCachedWeather(9.082, 7.492, logger)
  const second = cache.getCachedWeather(9.082, 7.492, logger)
  release(weather)
  const results = await Promise.all([first, second])

  assert.equal(calls, 1)
  assert.deepEqual(results.map((result) => result.cacheStatus), ["miss", "miss"])
})

test("an expired fresh entry is served stale if the provider is unavailable", async () => {
  let timestamp = 1_000
  let unavailable = false
  const cache = createWeatherCache(options(async () => {
    if (unavailable) throw new Error("provider unavailable")
    return weather
  }, { now: () => timestamp, freshTtlMs: 100, staleTtlMs: 500 }))

  const first = await cache.getCachedWeather(9.083, 7.493, logger)
  timestamp = 1_200
  unavailable = true
  const stale = await cache.getCachedWeather(9.083, 7.493, logger)

  assert.equal(first.cacheStatus, "miss")
  assert.equal(stale.cacheStatus, "stale")
  assert.deepEqual(stale.weather, weather)
})

test("Redis cache hits are shared across independent cache instances", async () => {
  const store = new Map<string, string>()
  const expirations: Array<{ key: string; seconds: number }> = []
  const redis = {
    status: "ready",
    async mget(...keys: string[]) { return keys.map((key) => store.get(key) ?? null) },
    async set(key: string, value: string, mode: string, seconds: number) {
      assert.equal(mode, "EX")
      store.set(key, value)
      expirations.push({ key, seconds })
      return "OK"
    }
  } as unknown as Pick<Redis, "status" | "mget" | "set">
  let providerCalls = 0
  const fetchWeather = async () => { providerCalls += 1; return weather }
  const firstProcess = createWeatherCache(options(fetchWeather, { redis }))
  const secondProcess = createWeatherCache(options(fetchWeather, { redis }))

  const first = await firstProcess.getCachedWeather(9.084, 7.494, logger)
  const second = await secondProcess.getCachedWeather(9.084, 7.494, logger)

  assert.equal(first.cacheStatus, "miss")
  assert.equal(second.cacheStatus, "hit")
  assert.equal(providerCalls, 1)
  assert.deepEqual(expirations.map(({ seconds }) => seconds).sort((a, b) => a - b), [300, 1800])
})
