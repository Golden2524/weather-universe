import type { FastifyInstance } from "fastify"

import {
  askWeatherAssistant,
  type WeatherContext
} from "./ai.service.js"

type AskRequest = {
  question?: string
  weather?: WeatherContext
}

export async function aiRoutes(app: FastifyInstance) {
  app.post<{ Body: AskRequest }>("/ask", async (request, reply) => {
    const question = request.body?.question?.trim()
    const weather = request.body?.weather

    if (!question) {
      return reply.code(400).send({
        error: "A question is required"
      })
    }

    if (!weather) {
      return reply.code(400).send({
        error: "Weather data is required"
      })
    }

    try {
      const answer = await askWeatherAssistant(
        question,
        weather
      )

      return {
        answer
      }
    } catch (error) {
      app.log.error(error)

      return reply.code(500).send({
        error: "Unable to generate an AI response"
      })
    }
  })
}