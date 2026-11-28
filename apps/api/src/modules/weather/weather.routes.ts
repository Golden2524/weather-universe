import type { FastifyInstance } from "fastify"
import { rateLimit } from "../../plugins/rate-limit.js"
import { getCachedWeather } from "./weather.service.js"
import type { WeatherData } from "@weather-universe/types"

import {
  generateWeatherInsights
} from "@weather-universe/weather-engine"

interface WeatherQuery {
  lat?: string
  lon?: string
}

type ValidCoordinates = {
  valid: true
  latitude: number
  longitude: number
}

type InvalidCoordinates = {
  valid: false
  error: string
}

type CoordinateValidationResult =
  | ValidCoordinates
  | InvalidCoordinates

function validateCoordinates(
  lat?: string,
  lon?: string
): CoordinateValidationResult {
  const latitude = lat?.trim() ? Number(lat) : Number.NaN
  const longitude = lon?.trim() ? Number(lon) : Number.NaN

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return {
      valid: false,
      error:
        "Query parameters 'lat' and 'lon' are required."
    }
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return {
      valid: false,
      error: "Invalid latitude or longitude."
    }
  }

  return {
    valid: true,
    latitude,
    longitude
  }
}

type WeatherRoutesOptions = { getWeather?: (latitude: number, longitude: number) => Promise<WeatherData> }

export async function weatherRoutes(app: FastifyInstance, options: WeatherRoutesOptions = {}) {
  /**
   * GET /weather
   *
   * Example:
   * /weather?lat=6.5244&lon=3.3792
   */
  app.get<{ Querystring: WeatherQuery }>(
    "/",
    {
      preHandler: rateLimit({ limit: 60, windowMs: 60_000, keyPrefix: "weather" }),
      schema: {
        querystring: {
          type: "object",
          required: ["lat", "lon"],
          additionalProperties: false,
          properties: {
            lat: { type: "string", minLength: 1, maxLength: 32 },
            lon: { type: "string", minLength: 1, maxLength: 32 }
          }
        }
      }
    },
    async (request, reply) => {
      const coordinates = validateCoordinates(
        request.query.lat,
        request.query.lon
      )

      if (!coordinates.valid) {
        return reply.status(400).send({
          error: coordinates.error
        })
      }

      const result = options.getWeather
        ? { weather: await options.getWeather(coordinates.latitude, coordinates.longitude), cacheStatus: "miss" as const }
        : await getCachedWeather(coordinates.latitude, coordinates.longitude, request.log)

      reply.header("X-Weather-Cache", result.cacheStatus)
      return result.weather
    }
  )

  /**
   * GET /weather/insights
   *
   * Example:
   * /weather/insights?lat=6.5244&lon=3.3792
   */
  app.get<{ Querystring: WeatherQuery }>(
    "/insights",
    {
      preHandler: rateLimit({ limit: 60, windowMs: 60_000, keyPrefix: "insights" }),
      schema: {
        querystring: {
          type: "object",
          required: ["lat", "lon"],
          additionalProperties: false,
          properties: {
            lat: { type: "string", minLength: 1, maxLength: 32 },
            lon: { type: "string", minLength: 1, maxLength: 32 }
          }
        }
      }
    },
    async (request, reply) => {
      const coordinates = validateCoordinates(
        request.query.lat,
        request.query.lon
      )

      if (!coordinates.valid) {
        return reply.status(400).send({
          error: coordinates.error
        })
      }

      const result = options.getWeather
        ? { weather: await options.getWeather(coordinates.latitude, coordinates.longitude), cacheStatus: "miss" as const }
        : await getCachedWeather(coordinates.latitude, coordinates.longitude, request.log)

      reply.header("X-Weather-Cache", result.cacheStatus)
      const insights = generateWeatherInsights(result.weather)

      return insights
    }
  )
}
