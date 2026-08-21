import type { FastifyInstance } from "fastify"

import { searchLocations } from "./location.service"

interface LocationSearchQuery {
  q?: string
}

export async function locationRoutes(
  app: FastifyInstance
) {
  app.get<{ Querystring: LocationSearchQuery }>(
    "/search",
    async (request, reply) => {
      const query = request.query.q?.trim()

      if (!query) {
        return reply.status(400).send({
          error: "Query parameter 'q' is required."
        })
      }

      if (query.length < 2) {
        return reply.status(400).send({
          error:
            "Location search query must contain at least 2 characters."
        })
      }

      const locations = await searchLocations(query)

      return {
        query,
        count: locations.length,
        results: locations
      }
    }
  )
}