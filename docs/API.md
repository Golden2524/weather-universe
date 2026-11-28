# HTTP API

The API is a JSON service. The production base URL is `https://weather-universe.onrender.com`; local development defaults to `http://localhost:4000`.

## Common behavior

- CORS allows only the exact origin(s) in `FRONTEND_URL`. Production requires this variable.
- Responses include standard security headers.
- Invalid payloads and query parameters return `400`. Rate limits return `429`; upstream service or protection-store failures return `503`.
- Rate-limit headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, and `X-RateLimit-Reset` (Unix seconds). A limited response also includes `Retry-After` (seconds).
- Weather routes include `X-Weather-Cache: hit`, `miss`, or `stale`.
- All limits are per client IP and use Redis in production. Without Redis, local development uses in-process counters.

## `GET /health`

Liveness check. It does not test external providers or Redis.

```json
{
  "status": "ok",
  "service": "weather-universe-api",
  "timestamp": "2026-11-26T11:29:27.044Z"
}
```

## `GET /health/ready`

Readiness check. Returns `200` when the API is ready; in production returns `503` if the shared rate-limit store is unavailable.

```json
{
  "status": "ready",
  "uptimeSeconds": 123,
  "dependencies": { "rateLimitStore": "ready" }
}
```

Without `REDIS_URL` in local development, `rateLimitStore` is `local-development`.

## `GET /weather?lat={latitude}&lon={longitude}`

Returns current weather and forecast data for geographic coordinates. `lat` is required and must be between `-90` and `90`; `lon` is required and must be between `-180` and `180`. Additional query parameters are rejected. Limit: 60 requests per minute per client.

```sh
curl "https://weather-universe.onrender.com/weather?lat=6.5244&lon=3.3792"
```

Response shape:

```json
{
  "location": { "latitude": 6.5244, "longitude": 3.3792, "timezone": "Africa/Lagos" },
  "current": {
    "time": "2026-11-26T12:00",
    "temperature": 28.1,
    "feelsLike": 31.2,
    "humidity": 70,
    "precipitation": 0,
    "weatherCode": 2,
    "condition": "partly-cloudy",
    "windSpeed": 12,
    "windDirection": 180,
    "cloudCover": 15
  },
  "hourly": [
    {
      "time": "2026-11-26T13:00",
      "temperature": 29,
      "feelsLike": 32,
      "precipitationProbability": 10,
      "precipitation": 0,
      "weatherCode": 2,
      "condition": "partly-cloudy",
      "windSpeed": 13
    }
  ],
  "daily": [
    {
      "date": "2026-11-26",
      "weatherCode": 2,
      "condition": "partly-cloudy",
      "temperatureMax": 31,
      "temperatureMin": 24,
      "precipitationProbabilityMax": 20,
      "sunrise": "2026-11-26T06:20",
      "sunset": "2026-11-26T18:10"
    }
  ],
  "updatedAt": "2026-11-26T12:00:00.000Z"
}
```

The arrays contain the hourly and daily forecast rows returned by the weather engine (up to seven forecast days). The example values are illustrative. Weather condition values are `clear`, `mainly-clear`, `partly-cloudy`, `overcast`, `fog`, `drizzle`, `rain`, `snow`, `rain-showers`, `snow-showers`, `thunderstorm`, or `unknown`.

## `GET /weather/insights?lat={latitude}&lon={longitude}`

Uses the same coordinate validation and request limit as `/weather`. Returns calculated insights based on current conditions and near-term forecast values.

```json
{
  "summary": "Conditions look generally comfortable for today.",
  "scores": { "comfort": 82, "outdoor": 76, "rainRisk": 18 },
  "highlights": [
    "Temperatures are currently fairly comfortable.",
    "Rain is unlikely in the immediate forecast."
  ]
}
```

Each score is bounded from 0 to 100. `rainRisk` describes risk from the next forecast hour and current precipitation; it is not a severe-weather warning.

## `GET /location/search?q={place}`

Searches for locations by name. `q` is required and must be 2–80 characters; additional query parameters are rejected. Limit: 30 requests per minute per client.

```sh
curl "https://weather-universe.onrender.com/location/search?q=Abuja"
```

```json
{
  "query": "Abuja",
  "count": 1,
  "results": [
    {
      "id": 233011,
      "name": "Abuja",
      "country": "Nigeria",
      "countryCode": "NG",
      "latitude": 9.0579,
      "longitude": 7.4951,
      "timezone": "Africa/Lagos",
      "admin1": "Federal Capital Territory"
    }
  ]
}
```

`admin1` is optional. An unknown place can return an empty `results` array with `count: 0`.

## `POST /ai/ask`

Asks the optional weather assistant to answer using supplied weather data. Limit: 8 requests per minute per client. The body is limited to 32 KB. If `OPENAI_API_KEY` is not configured, returns `503`.

```json
{
  "question": "Should I bring an umbrella this afternoon?",
  "weather": {
    "location": "Abuja",
    "current": {
      "temperature": 28,
      "feelsLike": 30,
      "humidity": 70,
      "windSpeed": 10,
      "precipitationProbability": 65,
      "uvIndex": 5
    },
    "hourly": [],
    "daily": []
  }
}
```

`question` is required and limited to 500 characters. `weather.location` and `weather.current` are required. Current values are numbers: temperature `-100..70`, feels-like `-120..80`, humidity and precipitation probability `0..100`, wind speed `0..500`, and UV index `0..30`. Optional `hourly` arrays accept at most 48 strict forecast objects; `daily` arrays accept at most 10 strict forecast objects. See `apps/api/src/modules/ai/ai.routes.ts` for the authoritative nested field schema and bounds.

Success response:

```json
{ "answer": "Rain is possible this afternoon, so bringing an umbrella would be sensible." }
```

The assistant is grounded in the supplied data and may say when the data is insufficient. Do not send secrets or unrelated personal information in the question.

## Error response examples

Validation errors use a generic shape to avoid exposing internal details:

```json
{ "error": "Invalid request. Check the supplied fields." }
```

Rate limit response:

```json
{ "error": "Too many requests. Please try again shortly." }
```

Temporary upstream or service failure:

```json
{ "error": "The requested service is temporarily unavailable." }
```
