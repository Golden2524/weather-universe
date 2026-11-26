import Fastify from "fastify"
import type { FastifyError } from "fastify"
import cors from "@fastify/cors"

import { locationRoutes } from "./modules/location/location.routes.js"
import { weatherRoutes } from "./modules/weather/weather.routes.js"
import { aiRoutes } from "./modules/ai/ai.routes.js"
import { closeRateLimitStore, connectRateLimitStore } from "./plugins/rate-limit.js"

const app = Fastify({
  logger: true,
  bodyLimit: 32 * 1024,
  // Public traffic reaches Render web services through Render's trusted edge proxy.
  trustProxy: true
})

app.addHook("onClose", closeRateLimitStore)

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

app.addHook("onSend", async (_request, reply) => {
  reply.header("X-Content-Type-Options", "nosniff")
  reply.header("X-Frame-Options", "DENY")
  reply.header("Referrer-Policy", "no-referrer")
  reply.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  reply.header("Cross-Origin-Resource-Policy", "same-site")
  reply.header("Strict-Transport-Security", "max-age=31536000; includeSubDomains")
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
  await connectRateLimitStore()
  await app.listen({
    port,
    host
  })
} catch (error) {
  app.log.error(error)
  process.exit(1)
}
