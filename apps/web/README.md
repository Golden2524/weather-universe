# Weather Universe

Weather Universe is a full-stack weather dashboard built with Next.js, Fastify, and Open-Meteo.

## Features

- Automatic browser location detection
- Manual city search
- Current weather conditions
- 12-hour forecast
- 7-day forecast
- Weather insights and scoring
- Celsius/Fahrenheit switching
- Saved location and temperature-unit preferences
- Manual refresh
- Automatic weather refresh
- Responsive desktop and mobile layout
- API health endpoint

## Project Structure

```text
apps/
├── api/              # Fastify weather API
└── web/              # Next.js frontend

packages/
├── recommendation-engine/
├── types/
└── weather-engine/