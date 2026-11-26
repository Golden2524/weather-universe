import type {
  WeatherCondition,
  WeatherData
} from "@weather-universe/types"

import type { OpenMeteoResponse } from "../providers/open-meteo.js"

export function getWeatherCondition(
  weatherCode: number
): WeatherCondition {
  switch (weatherCode) {
    case 0:
      return "clear"

    case 1:
      return "mainly-clear"

    case 2:
      return "partly-cloudy"

    case 3:
      return "overcast"

    case 45:
    case 48:
      return "fog"

    case 51:
    case 53:
    case 55:
    case 56:
    case 57:
      return "drizzle"

    case 61:
    case 63:
    case 65:
    case 66:
    case 67:
      return "rain"

    case 71:
    case 73:
    case 75:
    case 77:
      return "snow"

    case 80:
    case 81:
    case 82:
      return "rain-showers"

    case 85:
    case 86:
      return "snow-showers"

    case 95:
    case 96:
    case 99:
      return "thunderstorm"

    default:
      return "unknown"
  }
}

export function normalizeOpenMeteoWeather(
  data: OpenMeteoResponse
): WeatherData {
  const hourly = data.hourly.time.flatMap((time, index) => {
    const temperature = data.hourly.temperature_2m[index]
    const feelsLike = data.hourly.apparent_temperature[index]
    const precipitationProbability = data.hourly.precipitation_probability[index]
    const precipitation = data.hourly.precipitation[index]
    const weatherCode = data.hourly.weather_code[index]
    const windSpeed = data.hourly.wind_speed_10m[index]

    if (
      !Number.isFinite(temperature) || !Number.isFinite(feelsLike) ||
      !Number.isFinite(precipitationProbability) || !Number.isFinite(precipitation) ||
      !Number.isFinite(weatherCode) || !Number.isFinite(windSpeed)
    ) return []

    return [{ time, temperature, feelsLike, precipitationProbability, precipitation, weatherCode, condition: getWeatherCondition(weatherCode), windSpeed }]
  })

  const daily = data.daily.time.flatMap((date, index) => {
    const weatherCode = data.daily.weather_code[index]
    const temperatureMax = data.daily.temperature_2m_max[index]
    const temperatureMin = data.daily.temperature_2m_min[index]
    const precipitationProbabilityMax = data.daily.precipitation_probability_max[index]
    const sunrise = data.daily.sunrise[index]
    const sunset = data.daily.sunset[index]

    if (
      !Number.isFinite(weatherCode) || !Number.isFinite(temperatureMax) ||
      !Number.isFinite(temperatureMin) || !Number.isFinite(precipitationProbabilityMax) ||
      typeof sunrise !== "string" || typeof sunset !== "string"
    ) return []

    return [{ date, weatherCode, condition: getWeatherCondition(weatherCode), temperatureMax, temperatureMin, precipitationProbabilityMax, sunrise, sunset }]
  })

  return {
    location: {
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone
    },

    current: {
      time: data.current.time,
      temperature: data.current.temperature_2m,
      feelsLike: data.current.apparent_temperature,
      humidity: data.current.relative_humidity_2m,
      precipitation: data.current.precipitation,
      weatherCode: data.current.weather_code,
      condition: getWeatherCondition(
        data.current.weather_code
      ),
      windSpeed: data.current.wind_speed_10m,
      windDirection: data.current.wind_direction_10m,
      cloudCover: data.current.cloud_cover
    },

    hourly,
    daily,

    updatedAt: new Date().toISOString()
  }
}
