import { getOpenMeteoWeather } from "./providers/open-meteo"
import { normalizeOpenMeteoWeather } from "./adapters/normalize-weather"

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
} from "./providers/open-meteo"

export {
  normalizeOpenMeteoWeather,
  getWeatherCondition
} from "./adapters/normalize-weather"