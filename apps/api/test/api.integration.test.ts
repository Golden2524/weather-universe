import test from "node:test"
import assert from "node:assert/strict"
import { buildServer } from "../src/server.js"
import type { WeatherData } from "@weather-universe/types"

const weather: WeatherData = {
  location: { latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos" },
  current: { time: "2026-11-26T12:00", temperature: 28, feelsLike: 31, humidity: 70, precipitation: 0, weatherCode: 1, condition: "mainly-clear", windSpeed: 12, windDirection: 180, cloudCover: 15 },
  hourly: [], daily: [], updatedAt: "2026-11-26T12:00:00.000Z"
}

test("weather endpoints validate coordinates and return forecast plus insights", async () => {
  const app = await buildServer({ logger: false, getWeather: async () => weather })
  try {
    const missing = await app.inject({ url: "/weather" })
    assert.equal(missing.statusCode, 400)
    const invalid = await app.inject({ url: "/weather?lat=91&lon=7" })
    assert.equal(invalid.statusCode, 400)
    const forecast = await app.inject({ url: "/weather?lat=9&lon=7" })
    assert.equal(forecast.statusCode, 200)
    assert.equal(forecast.json().current.temperature, 28)
    assert.equal(forecast.headers["x-weather-cache"], "miss")
    const insights = await app.inject({ url: "/weather/insights?lat=9&lon=7" })
    assert.equal(insights.statusCode, 200)
    assert.ok(insights.json().scores.comfort >= 0)
  } finally { await app.close() }
})

test("location search validates input and returns provider results", async () => {
  let received = ""
  const app = await buildServer({ logger: false, searchLocations: async (query) => {
    received = query
    return [{ id: 1, name: "Abuja", country: "Nigeria", countryCode: "NG", latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos" }]
  } })
  try {
    assert.equal((await app.inject({ url: "/location/search?q=a" })).statusCode, 400)
    const result = await app.inject({ url: "/location/search?q=Abuja" })
    assert.equal(result.statusCode, 200)
    assert.equal(received, "Abuja")
    assert.equal(result.json().results[0].name, "Abuja")
  } finally { await app.close() }
})

test("AI endpoint rejects malformed payloads and calls assistant for valid input", async () => {
  let calls = 0
  const app = await buildServer({ logger: false, askWeatherAssistant: async (question) => { calls += 1; return `Forecast answer: ${question}` } })
  try {
    const bad = await app.inject({ method: "POST", url: "/ai/ask", payload: { question: "hi", extra: true } })
    assert.equal(bad.statusCode, 400)
    const good = await app.inject({ method: "POST", url: "/ai/ask", payload: { question: "Should I bring an umbrella?", weather: { location: "Abuja", current: { temperature: 28, feelsLike: 30, humidity: 70, windSpeed: 10, precipitationProbability: 80, uvIndex: 5 } } } })
    assert.equal(good.statusCode, 200)
    assert.match(good.json().answer, /umbrella/i)
    assert.equal(calls, 1)
  } finally { await app.close() }
})

test("AI endpoint enforces its per-client request limit", async () => {
  const app = await buildServer({ logger: false, askWeatherAssistant: async () => "ok" })
  const payload = { question: "How is the weather?", weather: { location: "Abuja", current: { temperature: 28, feelsLike: 30, humidity: 70, windSpeed: 10, precipitationProbability: 20, uvIndex: 5 } } }
  try {
    const statuses: number[] = []
    for (let attempt = 0; attempt < 9; attempt += 1) {
      const result = await app.inject({ method: "POST", url: "/ai/ask", headers: { "x-forwarded-for": "198.51.100.44" }, payload })
      statuses.push(result.statusCode)
      if (attempt === 8) {
        assert.equal(result.headers["x-ratelimit-limit"], "8")
        assert.equal(result.headers["retry-after"] !== undefined, true)
      }
    }
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 200, 200, 200, 429])
  } finally { await app.close() }
})

test("health and readiness return useful status with security headers", async () => {
  const app = await buildServer({ logger: false })
  try {
    const health = await app.inject({ url: "/health" })
    const ready = await app.inject({ url: "/health/ready" })
    assert.equal(health.json().status, "ok")
    assert.equal(ready.json().status, "ready")
    assert.equal(health.headers["x-content-type-options"], "nosniff")
    assert.equal(health.headers["x-frame-options"], "DENY")
  } finally { await app.close() }
})
