import test from "node:test"
import assert from "node:assert/strict"
import {
  calculateComfortScore, calculateOutdoorScore, calculateRainRisk,
  generateWeatherInsights, getWeatherCondition, normalizeOpenMeteoWeather
} from "@weather-universe/weather-engine"
import type { OpenMeteoResponse } from "../../../packages/weather-engine/providers/open-meteo.js"

test("weather scores remain bounded and respond to harsh conditions", () => {
  assert.equal(calculateComfortScore(22, 50, 8), 100)
  assert.ok(calculateComfortScore(42, 95, 70) < 40)
  assert.equal(calculateComfortScore(-500, 500, 1000), 0)
  assert.equal(calculateRainRisk(80, 1), 95)
  assert.equal(calculateRainRisk(100, 2), 100)
  assert.equal(calculateOutdoorScore(80, 100, 50), 10)
})

test("weather codes map to named conditions including unknowns", () => {
  assert.equal(getWeatherCondition(0), "clear")
  assert.equal(getWeatherCondition(51), "drizzle")
  assert.equal(getWeatherCondition(65), "rain")
  assert.equal(getWeatherCondition(95), "thunderstorm")
  assert.equal(getWeatherCondition(999), "unknown")
})

test("normalizer drops incomplete forecast rows and preserves current values", () => {
  const response: OpenMeteoResponse = {
    latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos",
    current: { time: "2026-11-26T12:00", temperature_2m: 31, apparent_temperature: 35, relative_humidity_2m: 80, precipitation: 0.2, weather_code: 61, wind_speed_10m: 12, wind_direction_10m: 240, cloud_cover: 75 },
    hourly: { time: ["2026-11-26T12:00", "2026-11-26T13:00"], temperature_2m: [31, 30], apparent_temperature: [35, 34], precipitation_probability: [50, 70], precipitation: [0.2, 2], weather_code: [61, 63], wind_speed_10m: [12, 14] },
    daily: { time: ["2026-11-26"], weather_code: [61], temperature_2m_max: [32], temperature_2m_min: [23], precipitation_probability_max: [75], sunrise: ["2026-11-26T06:20"], sunset: ["2026-11-26T18:10"] }
  }
  response.hourly.temperature_2m[1] = Number.NaN
  const normalized = normalizeOpenMeteoWeather(response)
  assert.equal(normalized.current.condition, "rain")
  assert.equal(normalized.hourly.length, 1)
  assert.equal(normalized.daily.length, 1)
  assert.equal(normalized.location.timezone, "Africa/Lagos")
})

test("insights return actionable rain recommendations and bounded scores", () => {
  const weather = normalizeOpenMeteoWeather({
    latitude: 9, longitude: 7, timezone: "Africa/Lagos",
    current: { time: "2026-11-26T12:00", temperature_2m: 31, apparent_temperature: 34, relative_humidity_2m: 82, precipitation: 0, weather_code: 2, wind_speed_10m: 10, wind_direction_10m: 0, cloud_cover: 20 },
    hourly: { time: ["2026-11-26T13:00"], temperature_2m: [31], apparent_temperature: [34], precipitation_probability: [90], precipitation: [1], weather_code: [61], wind_speed_10m: [10] },
    daily: { time: [], weather_code: [], temperature_2m_max: [], temperature_2m_min: [], precipitation_probability_max: [], sunrise: [], sunset: [] }
  })
  const insights = generateWeatherInsights(weather)
  assert.match(insights.summary, /rain/i)
  assert.ok(insights.highlights.some((item) => /umbrella/i.test(item)))
  for (const score of Object.values(insights.scores)) assert.ok(score >= 0 && score <= 100)
})
