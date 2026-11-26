import Fastify from "fastify"
import type { FastifyError } from "fastify"
import cors from "@fastify/cors"

import { locationRoutes } from "./modules/location/location.routes.js"
import { weatherRoutes } from "./modules/weather/weather.routes.js"
import { aiRoutes } from "./modules/ai/ai.routes.js"

const app = Fastify({
  logger: true,
  bodyLimit: 32 * 1024
})

const port = Number(process.env.PORT ?? 4000)
const host = process.env.HOST ?? "0.0.0.0"

const frontendOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean)

if (frontendOrigins.length === 0) {
  throw new Error("FRONTEND_URL must contain at least one allowed origin")
}

await app.register(cors, {
  origin: frontendOrigins,
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  maxAge: 600
})

app.setErrorHandler((error: FastifyError, request, reply) => {
  if (error.validation) {
    return reply.code(400).send({ error: "Invalid request. Check the supplied fields." })
  }

  request.log.error({ err: error }, "Unhandled API request error")
  const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 500
    ? error.statusCode
    : 503
  return reply.code(statusCode).send({ error: "The requested service is temporarily unavailable." })
})

await app.register(weatherRoutes, {
  prefix: "/weather"
})

await app.register(locationRoutes, {
  prefix: "/location"
})

await app.register(aiRoutes, {
  prefix: "/ai"
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
