import type {
  WeatherCondition,
  WeatherData
} from "@weather-universe/types"

import type { OpenMeteoResponse } from "../providers/open-meteo"

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

    hourly: data.hourly.time.map((time, index) => ({
      time,
      temperature: data.hourly.temperature_2m[index],
      feelsLike: data.hourly.apparent_temperature[index],
      precipitationProbability:
        data.hourly.precipitation_probability[index],
      precipitation:
        data.hourly.precipitation[index],
      weatherCode: data.hourly.weather_code[index],
      condition: getWeatherCondition(
        data.hourly.weather_code[index]
      ),
      windSpeed: data.hourly.wind_speed_10m[index]
    })),

    daily: data.daily.time.map((date, index) => ({
      date,
      weatherCode: data.daily.weather_code[index],
      condition: getWeatherCondition(
        data.daily.weather_code[index]
      ),
      temperatureMax:
        data.daily.temperature_2m_max[index],
      temperatureMin:
        data.daily.temperature_2m_min[index],
      precipitationProbabilityMax:
        data.daily.precipitation_probability_max[index],
      sunrise: data.daily.sunrise[index],
      sunset: data.daily.sunset[index]
    })),

    updatedAt: new Date().toISOString()
  }
}