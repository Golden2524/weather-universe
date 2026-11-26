export interface OpenMeteoResponse {
  latitude: number
  longitude: number
  timezone: string

  current: {
    time: string
    temperature_2m: number
    apparent_temperature: number
    relative_humidity_2m: number
    precipitation: number
    weather_code: number
    wind_speed_10m: number
    wind_direction_10m: number
    cloud_cover: number
  }

  hourly: {
    time: string[]
    temperature_2m: number[]
    apparent_temperature: number[]
    precipitation_probability: number[]
    precipitation: number[]
    weather_code: number[]
    wind_speed_10m: number[]
  }

  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
    sunrise: string[]
    sunset: string[]
  }
}

export class WeatherProviderError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = "WeatherProviderError"
  }
}

const REQUEST_TIMEOUT_MS = 8_000
const RETRYABLE_STATUSES = new Set([429, 500, 502, 503, 504])

const BASE_URL = "https://api.open-meteo.com/v1/forecast"

function wait(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

export async function getOpenMeteoWeather(
  latitude: number,
  longitude: number
): Promise<OpenMeteoResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),

    current: [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
      "cloud_cover"
    ].join(","),

    hourly: [
      "temperature_2m",
      "apparent_temperature",
      "precipitation_probability",
      "precipitation",
      "weather_code",
      "wind_speed_10m"
    ].join(","),

    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_probability_max",
      "sunrise",
      "sunset"
    ].join(","),

    timezone: "auto",
    forecast_days: "7"
  })

  let response: Response | undefined
  let requestError: unknown
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await fetch(`${BASE_URL}?${params.toString()}`, {
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
      })
      requestError = undefined
      if (response.ok || !RETRYABLE_STATUSES.has(response.status) || attempt === 1) break

      const retryAfterSeconds = Number(response.headers.get("retry-after"))
      const retryDelay = Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
        ? Math.min(2_000, retryAfterSeconds * 1_000)
        : 250
      await wait(retryDelay)
    } catch (error) {
      requestError = error
      if (attempt === 1) break
      await wait(250)
    }
  }

  if (requestError) {
    throw new WeatherProviderError("Weather provider request failed", { cause: requestError })
  }

  if (!response) {
    throw new WeatherProviderError("Weather provider request failed")
  }

  if (!response.ok) {
    throw new WeatherProviderError(`Weather provider returned status ${response.status}`)
  }

  let data: unknown
  try {
    data = await response.json()
  } catch (error) {
    throw new WeatherProviderError("Weather provider returned invalid JSON", { cause: error })
  }

  if (!isOpenMeteoResponse(data)) {
    throw new WeatherProviderError("Weather provider response is missing required forecast data")
  }

  return data
}

function isOpenMeteoResponse(value: unknown): value is OpenMeteoResponse {
  if (!value || typeof value !== "object") return false
  const data = value as Partial<OpenMeteoResponse>
  return Boolean(
    Number.isFinite(data.latitude) &&
    Number.isFinite(data.longitude) &&
    typeof data.timezone === "string" &&
    data.current && typeof data.current.time === "string" &&
    Number.isFinite(data.current.temperature_2m) &&
    Number.isFinite(data.current.weather_code) &&
    data.hourly && Array.isArray(data.hourly.time) &&
    Array.isArray(data.hourly.temperature_2m) &&
    data.daily && Array.isArray(data.daily.time)
  )
}
