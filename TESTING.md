# Testing and quality checks

Run these from the repository root:

```sh
pnpm test          # API integration/unit tests and frontend component tests
pnpm test:e2e      # Browser journey (requires Microsoft Edge on Windows)
pnpm test:e2e:live # Unmocked browser journey against deployed frontend and API
pnpm lint
pnpm typecheck
pnpm build
pnpm smoke:prod    # Read-only probes against the hosted API
```

The API tests use Fastify's in-process injector and mock weather, geocoding, and AI providers. Dedicated cache tests exercise local caching, request deduplication, stale fallback, and Redis sharing. Frontend component tests run in jsdom. The mocked Playwright journey covers dashboard interactions; the live journey calls the deployed frontend and API without route mocks, including real weather and city search. The production smoke script asserts readiness, a fresh cache miss, a subsequent cache hit, and insights; set `API_BASE_URL` to target another API deployment.

The production probe uses a 60-second timeout to allow a hosted service to wake from idle. Its reported latency is end-to-end and includes that cold-start delay. GitHub Actions runs the local quality suite on pull requests and main-branch pushes, then runs the unmocked production browser journey and smoke checks after a main-branch push or manual workflow dispatch.
