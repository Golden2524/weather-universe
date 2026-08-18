import type { FastifyInstance } from "fastify"

import { getWeather } from "@weather-universe/weather-engine"

interface WeatherQuery {
  lat: string
  lon: string
}

export async function weatherRoutes(
  app: FastifyInstance
) {
  app.get<{ Querystring: WeatherQuery }>(
    "/",
    async (request, reply) => {
      const latitude = Number(request.query.lat)
      const longitude = Number(request.query.lon)

      if (
        Number.isNaN(latitude) ||
        Number.isNaN(longitude)
      ) {
        return reply.status(400).send({
          error:
            "Query parameters 'lat' and 'lon' are required."
        })
      }

      if (
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180
      ) {
        return reply.status(400).send({
          error: "Invalid latitude or longitude."
        })
      }

      const weather = await getWeather(
        latitude,
        longitude
      )

      return weather
    }
  )
}