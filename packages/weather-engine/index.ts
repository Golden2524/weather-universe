import { getOpenMeteoWeather } from "./providers/open-meteo.js"
import { normalizeOpenMeteoWeather } from "./adapters/normalize-weather.js"

export async function getWeather(
  latitude: number,
  longitude: number
) {
  const rawWeather = await getOpenMeteoWeather(
    latitude,
    longitude
  )

  return normalizeOpenMeteoWeather(rawWeather)
}

export {
  getOpenMeteoWeather
} from "./providers/open-meteo.js"

export {
  normalizeOpenMeteoWeather,
  getWeatherCondition
} from "./adapters/normalize-weather.js"

export {
  generateWeatherInsights
} from "./insights/generate-insights.js"

export type {
  WeatherInsights
} from "./insights/generate-insights.js"

export {
  calculateComfortScore
} from "./calculations/comfort-score.js"

export {
  calculateOutdoorScore
} from "./calculations/outdoor-score.js"

export {
  calculateRainRisk
} from "./calculations/rain-score.js"