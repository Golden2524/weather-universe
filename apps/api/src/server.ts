import Fastify from "fastify"
import cors from "@fastify/cors"

import { locationRoutes } from "./modules/location/location.routes"
import { weatherRoutes } from "./modules/weather/weather.routes"

const app = Fastify({
  logger: true
})

await app.register(cors, {
  origin: true
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
    port: 4000,
    host: "0.0.0.0"
  })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}