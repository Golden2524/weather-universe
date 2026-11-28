# Testing and quality checks

Run these from the repository root:

```sh
pnpm test          # API integration/unit tests and frontend component tests
pnpm test:e2e      # Browser journey (requires Microsoft Edge on Windows)
pnpm lint
pnpm typecheck
pnpm build
pnpm smoke:prod    # Read-only probes against the hosted API
```

The API tests use Fastify's in-process injector and mock weather, geocoding, and AI providers. Frontend component tests run in jsdom. The Playwright journey runs the dashboard through weather load, temperature-unit switching, city search/selection, and refresh. The live smoke script checks readiness, a weather response, cache reuse, and insights; set `API_BASE_URL` to target another API deployment.

The production probe uses a 60-second timeout to allow a hosted service to wake from idle. Its reported latency is end-to-end and includes that cold-start delay.
