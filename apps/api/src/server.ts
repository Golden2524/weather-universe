import Fastify from "fastify"
import { resolve } from "node:path"
import { pathToFileURL } from "node:url"
import type { FastifyError } from "fastify"
import cors from "@fastify/cors"
import type { WeatherData } from "@weather-universe/types"
import { locationRoutes } from "./modules/location/location.routes.js"
import type { LocationResult } from "./modules/location/location.service.js"
import { weatherRoutes } from "./modules/weather/weather.routes.js"
import { aiRoutes } from "./modules/ai/ai.routes.js"
import type { WeatherContext } from "./modules/ai/ai.service.js"
import { closeSharedRedis, connectSharedRedis, sharedRedis } from "./plugins/redis-client.js"

export interface ServerDependencies {
  logger?: boolean
  getWeather?: (latitude: number, longitude: number) => Promise<WeatherData>
  searchLocations?: (query: string) => Promise<LocationResult[]>
  askWeatherAssistant?: (question: string, weather: WeatherContext) => Promise<string>
}

export async function buildServer(dependencies: ServerDependencies = {}) {
  const app = Fastify({
    logger: dependencies.logger ?? process.env.NODE_ENV !== "test",
    bodyLimit: 32 * 1024,
    trustProxy: true
  })

  app.addHook("onClose", closeSharedRedis)

  const frontendOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000")
    .split(",").map((origin) => origin.trim()).filter(Boolean)
  if (frontendOrigins.length === 0) throw new Error("FRONTEND_URL must contain at least one allowed origin")

  await app.register(cors, {
    origin: frontendOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
    exposedHeaders: ["X-Weather-Cache"],
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
    if (error.validation) return reply.code(400).send({ error: "Invalid request. Check the supplied fields." })
    request.log.error({ err: error }, "Unhandled API request error")
    const statusCode = error.statusCode && error.statusCode >= 400 && error.statusCode < 500 ? error.statusCode : 503
    return reply.code(statusCode).send({ error: "The requested service is temporarily unavailable." })
  })

  await app.register(weatherRoutes, { prefix: "/weather", getWeather: dependencies.getWeather })
  await app.register(locationRoutes, { prefix: "/location", searchLocations: dependencies.searchLocations })
  await app.register(aiRoutes, { prefix: "/ai", askWeatherAssistant: dependencies.askWeatherAssistant })

  app.get("/health", async () => ({ status: "ok", service: "weather-universe-api", timestamp: new Date().toISOString() }))
  app.get("/health/ready", async (_request, reply) => {
    const rateLimitStoreReady = !process.env.REDIS_URL || sharedRedis?.status === "ready"
    if (!rateLimitStoreReady) return reply.code(503).send({ status: "not_ready", dependencies: { rateLimitStore: "unavailable" } })
    return { status: "ready", uptimeSeconds: Math.floor(process.uptime()), dependencies: { rateLimitStore: sharedRedis ? "ready" : "local-development" } }
  })

  return app
}

async function start() {
  const app = await buildServer()
  try {
    await connectSharedRedis()
    await app.listen({ port: Number(process.env.PORT ?? 4000), host: process.env.HOST ?? "0.0.0.0" })
  } catch (error) {
    app.log.error(error)
    process.exit(1)
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await start()
}
