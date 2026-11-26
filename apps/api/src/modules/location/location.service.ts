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
const GEOCODING_TIMEOUT_MS = 5_000

export async function searchLocations(
  query: string
): Promise<LocationResult[]> {
  const params = new URLSearchParams({
    name: query,
    count: "10",
    language: "en",
    format: "json"
  })

  let response: Response
  try {
    response = await fetch(`${GEOCODING_URL}?${params.toString()}`, {
      signal: AbortSignal.timeout(GEOCODING_TIMEOUT_MS)
    })
  } catch (error) {
    throw new Error("Location provider request failed", { cause: error })
  }

  if (!response.ok) {
    throw new Error(
      `Location search failed with status ${response.status}`
    )
  }

  let data: OpenMeteoGeocodingResponse
  try {
    data = (await response.json()) as OpenMeteoGeocodingResponse
  } catch (error) {
    throw new Error("Location provider returned invalid JSON", { cause: error })
  }

  if (!data.results) {
    return []
  }

  return data.results.filter((location) =>
    Number.isFinite(location.id) && Number.isFinite(location.latitude) &&
    Number.isFinite(location.longitude) && typeof location.timezone === "string" &&
    typeof location.name === "string" && typeof location.country === "string"
  ).map((location) => ({
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
