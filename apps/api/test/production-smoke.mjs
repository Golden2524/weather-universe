import { randomInt } from "node:crypto"

const baseUrl = (process.env.API_BASE_URL ?? "https://weather-universe.onrender.com").replace(/\/$/, "")
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "https://weather-universe-web-ew28.vercel.app"
const results = []

async function probe(path, expectedStatus = 200, requestOptions = {}) {
  const started = performance.now()
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, { ...requestOptions, signal: AbortSignal.timeout(60_000) })
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
const latitude = (9 + randomInt(0, 1_000_000) / 10_000_000).toFixed(5)
const longitude = (7 + randomInt(0, 1_000_000) / 10_000_000).toFixed(5)
const weatherPath = `/weather?lat=${latitude}&lon=${longitude}`
const corsCheck = await probe(weatherPath, 204, {
  method: "OPTIONS",
  headers: {
    Origin: frontendOrigin,
    "Access-Control-Request-Method": "GET"
  }
})
const allowedOrigin = corsCheck.response.headers.get("access-control-allow-origin")
if (allowedOrigin !== frontendOrigin) {
  throw new Error(`CORS did not allow the deployed frontend origin ${frontendOrigin}; received ${allowedOrigin ?? "no allow-origin header"}`)
}
const firstWeather = await probe(weatherPath)
if (!firstWeather.body?.current || !Array.isArray(firstWeather.body?.daily)) throw new Error("Weather response is missing expected forecast fields")
const secondWeather = await probe(weatherPath)
const firstCacheStatus = firstWeather.response.headers.get("x-weather-cache")
const secondCacheStatus = secondWeather.response.headers.get("x-weather-cache")
if (firstCacheStatus !== "miss") throw new Error(`Expected first weather request to miss cache, received ${firstCacheStatus}`)
if (secondCacheStatus !== "hit") throw new Error(`Expected second weather request to hit cache, received ${secondCacheStatus}`)
await probe(`/weather/insights?lat=${latitude}&lon=${longitude}`)
console.log(JSON.stringify({ baseUrl, frontendOrigin, corsAllowedOrigin: allowedOrigin, probes: results, cacheHeaderFirst: firstCacheStatus, cacheHeaderSecond: secondCacheStatus }, null, 2))
