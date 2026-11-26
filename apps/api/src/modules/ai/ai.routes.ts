import type { FastifyInstance } from "fastify"
import { rateLimit } from "../../plugins/rate-limit.js"

import {
  askWeatherAssistant,
  type WeatherContext
} from "./ai.service.js"

type AskRequest = {
  question?: string
  weather?: WeatherContext
}

export async function aiRoutes(app: FastifyInstance) {
  app.post<{ Body: AskRequest }>("/ask", {
    bodyLimit: 32 * 1024,
    preHandler: rateLimit({ limit: 8, windowMs: 60_000, keyPrefix: "ai" }),
    schema: {
      body: {
        type: "object",
        required: ["question", "weather"],
        additionalProperties: false,
        properties: {
          question: { type: "string", minLength: 1, maxLength: 500 },
          weather: {
            type: "object",
            required: ["location", "current"],
            additionalProperties: false,
            properties: {
              location: { type: "string", minLength: 1, maxLength: 120 },
              current: {
                type: "object",
                required: ["temperature", "feelsLike", "humidity", "windSpeed", "precipitationProbability", "uvIndex"],
                additionalProperties: false,
                properties: {
                  temperature: { type: "number", minimum: -100, maximum: 70 },
                  feelsLike: { type: "number", minimum: -120, maximum: 80 },
                  humidity: { type: "number", minimum: 0, maximum: 100 },
                  windSpeed: { type: "number", minimum: 0, maximum: 500 },
                  precipitationProbability: { type: "number", minimum: 0, maximum: 100 },
                  uvIndex: { type: "number", minimum: 0, maximum: 30 }
                }
              },
              hourly: { type: "array", maxItems: 48, items: { type: "object", maxProperties: 16 } },
              daily: { type: "array", maxItems: 10, items: { type: "object", maxProperties: 16 } }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const question = request.body?.question?.trim()
    const weather = request.body?.weather

    if (!question || !weather) {
      return reply.code(400).send({ error: "A question and weather data are required." })
    }

    try {
      const answer = await askWeatherAssistant(
        question,
        weather
      )

      return { answer }
    } catch (error) {
      app.log.error(
        {
          error
        },
        "Weather AI request failed"
      )

      if (
        error instanceof Error &&
        error.message ===
        "OPENAI_API_KEY is not configured"
      ) {
        return reply.code(503).send({
          error: "Weather AI is not configured."
        })
      }

      return reply.code(503).send({
        error:
          "Weather AI is temporarily unavailable."
      })
    }
  })
}
