const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"

export interface LocationResult {
  id: number
  name: string
  country: string
  countryCode: string
  latitude: number
  longitude: number
  timezone: string
  admin1?: string
}

interface LocationSearchResponse {
  query: string
  count: number
  results: LocationResult[]
}

interface ReverseGeocodingResponse {
  latitude: number
  longitude: number
  city?: string
  locality?: string
  principalSubdivision?: string
  countryName?: string
  countryCode?: string
}

export interface WeatherData {
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    precipitation: number
    precipitationProbability?: number
    uvIndex?: number
    weatherCode?: number
    condition: string
  }

  hourly: Array<{
    time?: string
    temperature: number
    feelsLike?: number
    precipitationProbability: number
    precipitation?: number
    weatherCode?: number
    condition?: string
    windSpeed?: number
  }>

  daily?: Array<{
    date?: string
    weatherCode?: number
    condition?: string
    temperatureMax: number
    temperatureMin: number
    precipitationProbabilityMax?: number
    sunrise?: string
    sunset?: string
  }>

  updatedAt?: string
}

export interface WeatherAssistantContext {
  location: string
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    precipitationProbability: number
    uvIndex: number
  }
  hourly: WeatherData["hourly"]
  daily: WeatherData["daily"]
}

export async function searchLocations(
  query: string
): Promise<LocationResult[]> {
  const response = await fetch(
    `${API_URL}/location/search?q=${encodeURIComponent(query)}`
  )

  if (!response.ok) {
    throw new Error("Failed to search locations.")
  }

  const data =
    (await response.json()) as LocationSearchResponse

  return data.results
}

export async function getWeather(
  latitude: number,
  longitude: number
) {
  const response = await fetch(
    `${API_URL}/weather?lat=${latitude}&lon=${longitude}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch weather.")
  }

  return response.json()
}

export async function getWeatherInsights(
  latitude: number,
  longitude: number
) {
  const response = await fetch(
    `${API_URL}/weather/insights?lat=${latitude}&lon=${longitude}`
  )

  if (!response.ok) {
    throw new Error("Failed to fetch weather insights.")
  }

  return response.json()
}

export async function askWeatherAssistant(
  question: string,
  weather: WeatherAssistantContext
): Promise<string> {
  const response = await fetch(`${API_URL}/ai/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      question,
      weather
    })
  })

  if (!response.ok) {
    const data = (await response.json().catch(
      () => null
    )) as {
      error?: string
    } | null

    throw new Error(
      data?.error ??
      "The weather assistant is temporarily unavailable."
    )
  }

  const data = (await response.json()) as {
    answer?: string
  }

  if (!data.answer) {
    throw new Error(
      "The weather assistant did not return an answer."
    )
  }

  return data.answer
}

export async function getLocationFromCoordinates(
  latitude: number,
  longitude: number
): Promise<LocationResult | null> {
  const response = await fetch(
    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
  )

  if (!response.ok) {
    throw new Error("Failed to detect your location.")
  }

  const data =
    (await response.json()) as ReverseGeocodingResponse

  const name =
    data.city ??
    data.locality ??
    data.principalSubdivision

  if (!name || !data.countryName) {
    return null
  }

  return {
    id: Math.round(
      latitude * 100000 + longitude * 100000
    ),
    name,
    country: data.countryName,
    countryCode: data.countryCode ?? "",
    latitude,
    longitude,
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone
  }
}

export function getBrowserLocation(): Promise<{
  latitude: number
  longitude: number
}> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(
        new Error(
          "Location detection is not supported by this browser."
        )
      )

      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }
    )
  })
}