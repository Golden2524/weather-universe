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