import Fastify from "fastify"
import cors from "@fastify/cors"

import { locationRoutes } from "./modules/location/location.routes.js"
import { weatherRoutes } from "./modules/weather/weather.routes.js"

const app = Fastify({
  logger: true
})

const port = Number(process.env.PORT ?? 4000)
const host = process.env.HOST ?? "0.0.0.0"

const frontendUrl =
  process.env.FRONTEND_URL ?? "http://localhost:3000"

await app.register(cors, {
  origin: frontendUrl
})

await app.register(weatherRoutes, {
  prefix: "/weather"
})

await app.register(locationRoutes, {
  prefix: "/location"
})

app.get("/health", async () => {
  return {
    status: "ok",
    service: "weather-universe-api",
    timestamp: new Date().toISOString()
  }
})

try {
  await app.listen({
    port,
    host
  })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}