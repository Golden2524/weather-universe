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

interface OpenMeteoGeocodingResponse {
  results?: Array<{
    id: number
    name: string
    latitude: number
    longitude: number
    timezone: string
    country: string
    country_code: string
    admin1?: string
  }>
}

const GEOCODING_URL =
  "https://geocoding-api.open-meteo.com/v1/search"

export async function searchLocations(
  query: string
): Promise<LocationResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: "10",
    language: "en",
    format: "json"
  })

  const response = await fetch(
    `${GEOCODING_URL}?${params.toString()}`
  )

  if (!response.ok) {
    throw new Error(
      `Location search failed with status ${response.status}`
    )
  }

  const data =
    (await response.json()) as OpenMeteoGeocodingResponse

  if (!data.results) {
    return []
  }

  return data.results.map((location) => ({
    id: location.id,
    name: location.name,
    country: location.country,
    countryCode: location.country_code,
    latitude: location.latitude,
    longitude: location.longitude,
    timezone: location.timezone,
    admin1: location.admin1
  }))
}