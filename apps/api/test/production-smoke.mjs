const baseUrl = (process.env.API_BASE_URL ?? "https://weather-universe.onrender.com").replace(/\/$/, "")
const results = []

async function probe(path, expectedStatus = 200) {
  const started = performance.now()
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, { signal: AbortSignal.timeout(60_000) })
  } catch (error) {
    throw new Error(`Production probe ${path} failed: ${error instanceof Error ? error.message : String(error)}`, { cause: error })
  }
  const elapsedMs = Math.round(performance.now() - started)
  const body = await response.json().catch(() => null)
  results.push({ path, status: response.status, elapsedMs, ok: response.status === expectedStatus })
  if (response.status !== expectedStatus) throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`)
  return { response, body }
}

await probe("/health/ready")
const weatherPath = "/weather?lat=9.0579&lon=7.4951"
const firstWeather = await probe(weatherPath)
if (!firstWeather.body?.current || !Array.isArray(firstWeather.body?.daily)) throw new Error("Weather response is missing expected forecast fields")
const secondWeather = await probe(weatherPath)
await probe("/weather/insights?lat=9.0579&lon=7.4951")
console.log(JSON.stringify({ baseUrl, probes: results, cacheHeaderFirst: firstWeather.response.headers.get("x-weather-cache"), cacheHeaderSecond: secondWeather.response.headers.get("x-weather-cache") }, null, 2))
