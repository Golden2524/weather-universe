# Weather Universe

Weather Universe is a full-stack weather dashboard that turns a forecast into a visual, location-aware briefing. Its interface adapts to the current conditions, while the API supplies forecasts, practical insights, and optional AI explanations.

| | |
| --- | --- |
| **Live dashboard** | [weather-universe-web-ew28.vercel.app](https://weather-universe-web-ew28.vercel.app) |
| **API health** | [weather-universe.onrender.com/health](https://weather-universe.onrender.com/health) |
| **API readiness** | [weather-universe.onrender.com/health/ready](https://weather-universe.onrender.com/health/ready) |

## What it does

- Shows current conditions, a 12-hour forecast, and a 7-day forecast.
- Changes the dashboard atmosphere for rain, sun, and temperature conditions, with condition-specific summaries.
- Finds locations by city name or, with browser permission, the device's current location.
- Gives weather insights with comfort, outdoor, and rain-risk scores.
- Ranks promising two-hour windows for walking, running, and cycling.
- Includes an optional AI weather assistant when the API has an OpenAI key configured.
- Supports Celsius and Fahrenheit, saved location and unit preferences, manual refresh, and automatic refresh.
- Adapts to mobile and desktop screens.

Weather data and city search come from Open-Meteo. The optional assistant uses OpenAI. Browser location is opt-in and handled in the browser.

## Technology

- **Web:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **API:** Fastify 5, TypeScript, JSON Schema validation
- **Workspace:** pnpm, Turborepo
- **Weather:** Open-Meteo Forecast and Geocoding APIs
- **Cache and shared rate limits:** Redis-compatible store through ioredis
- **Quality:** Node test runner, Vitest, Playwright, ESLint, TypeScript
- **Hosting:** Vercel (web) and Render (API)

## Run locally

Requirements: Node.js 24 and pnpm 11.22.0. A Redis-compatible server is required for shared production rate limits. The API can run without Redis in local development; if you use the example `.env`, comment out `REDIS_URL` unless a local Redis-compatible service is running. Without Redis, local development uses in-memory rate-limit counters.

```sh
pnpm install --frozen-lockfile
pnpm --filter @weather-universe/types build
pnpm --filter @weather-universe/weather-engine build
```

Create local environment files from the examples:

```sh
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Set `NEXT_PUBLIC_API_URL=http://localhost:4000` in `apps/web/.env.local`. For the API, set `FRONTEND_URL=http://localhost:3000`; set `REDIS_URL` only if a local Redis-compatible service is available. `OPENAI_API_KEY` is optional.

Start the API and web app in separate terminals:

```sh
pnpm --filter @weather-universe/api exec node --env-file=.env --import tsx --watch src/server.ts
```

```sh
pnpm --filter web dev
```

Open [http://localhost:3000](http://localhost:3000). The API listens at [http://localhost:4000](http://localhost:4000) by default.

See [environment variables](#environment-variables) for production requirements and [Testing](TESTING.md) for validation commands.

## Environment variables

| Variable | Used by | Required | Description |
| --- | --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Web | Production | Public API base URL, such as `https://weather-universe.onrender.com`. Defaults to `http://localhost:4000` for local development. |
| `FRONTEND_URL` | API | Production | Exact allowed frontend origin(s), comma-separated if needed. Production requires HTTPS origins; localhost HTTP is allowed for development. |
| `REDIS_URL` | API | Production | Redis connection URL. Required in production for shared rate limits; also used by the weather cache. |
| `OPENAI_API_KEY` | API | Optional | Enables AI weather answers. Keep this server-side; never expose it as a `NEXT_PUBLIC_` variable. |
| `PORT` | API | Hosting platform | Port to listen on. Defaults to `4000`. |
| `HOST` | API | Optional | Bind address. Defaults to `0.0.0.0`. |

Use `apps/api/.env.example` and `apps/web/.env.example` as the source of truth for local setup. Configure production values in the hosting providers' environment settings rather than committing secrets.

## Workspace layout

```text
apps/
  api/                       Fastify server, routes, cache, rate limiting, tests
  web/                       Next.js dashboard, UI components, browser tests
packages/
  types/                     Shared weather data contracts
  weather-engine/            Provider adapter, normalization, calculations, insights
  recommendation-engine/     Activity scoring modules
docs/
  API.md                     HTTP endpoint reference
  ARCHITECTURE.md            Request and deployment architecture
```

More details: [Architecture](docs/ARCHITECTURE.md) · [API reference](docs/API.md) · [Testing](TESTING.md)

## Deployment

The web app is configured for Vercel and the API for Render. Production configuration requires:

1. `NEXT_PUBLIC_API_URL` on the web deployment, pointing to the API origin.
2. `FRONTEND_URL` on the API, set to the deployed web origin (or a comma-separated list of exact origins).
3. `REDIS_URL` on the API, using the hosting provider's Redis-compatible service URL.
4. `OPENAI_API_KEY` on the API only if the assistant should answer questions.
5. `/health/ready` as the API's readiness/health-check path.

The main-branch GitHub Actions workflow runs tests, lint, typecheck, build, and a mocked browser journey. After those pass on a push or manual run, it also probes the live API and runs a browser journey against the deployed app. See [TESTING.md](TESTING.md) for what each check covers.

## Project documentation

- [Architecture and data flow](docs/ARCHITECTURE.md)
- [HTTP API reference](docs/API.md)
- [Testing and CI](TESTING.md)
