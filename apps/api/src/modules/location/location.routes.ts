import type { FastifyInstance } from "fastify"
import { rateLimit } from "../../plugins/rate-limit.js"

import { searchLocations } from "./location.service.js"

interface LocationSearchQuery {
  q?: string
}

export async function locationRoutes(
  app: FastifyInstance
) {
  app.get<{ Querystring: LocationSearchQuery }>(
    "/search",
    {
      preHandler: rateLimit({ limit: 30, windowMs: 60_000, keyPrefix: "location" }),
      schema: {
        querystring: {
          type: "object",
          required: ["q"],
          additionalProperties: false,
          properties: { q: { type: "string", minLength: 2, maxLength: 80 } }
        }
      }
    },
    async (request, reply) => {
      const query = request.query.q?.trim()

      if (!query) {
        return reply.status(400).send({
          error: "Query parameter 'q' is required."
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
