import type { FastifyInstance } from "fastify"

import {
  generateWeatherInsights,
  getWeather
} from "@weather-universe/weather-engine"

interface WeatherQuery {
  lat: string
  lon: string
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
  lat: string,
  lon: string
): CoordinateValidationResult {
  const latitude = Number(lat)
  const longitude = Number(lon)

  if (
    Number.isNaN(latitude) ||
    Number.isNaN(longitude)
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

export async function weatherRoutes(
  app: FastifyInstance
) {
  /**
   * GET /weather
   *
   * Example:
   * /weather?lat=6.5244&lon=3.3792
   */
  app.get<{ Querystring: WeatherQuery }>(
    "/",
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

      const weather = await getWeather(
        coordinates.latitude,
        coordinates.longitude
      )

      return weather
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

      const weather = await getWeather(
        coordinates.latitude,
        coordinates.longitude
      )

      const insights =
        generateWeatherInsights(weather)

      return insights
    }
  )
}