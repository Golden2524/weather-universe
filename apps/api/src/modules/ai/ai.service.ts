import OpenAI from "openai"

export type WeatherContext = {
  location: string
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    precipitationProbability: number
    uvIndex: number
  }
  hourly?: unknown[]
  daily?: unknown[]
}

const apiKey = process.env.OPENAI_API_KEY

const openai = apiKey
  ? new OpenAI({
    apiKey
  })
  : null

export async function askWeatherAssistant(
  question: string,
  weather: WeatherContext
): Promise<string> {
  if (!openai) {
    throw new Error("OPENAI_API_KEY is not configured")
  }

  const response = await openai.responses.create({
    model: "gpt-4.1-mini",
    instructions: `
You are Weather Universe's weather assistant.

Your job is to help users understand their current weather, forecasts,
and the information displayed in the Weather Universe dashboard.

Answer questions using the weather data provided by the application.

You can:
- explain current weather conditions
- explain the hourly and daily forecast
- explain humidity, wind, UV index, precipitation probability,
  feels-like temperature, and other weather concepts
- compare weather between forecast periods
- give practical, reasonable weather suggestions based on the supplied data
- explain what dashboard cards and metrics mean

Important rules:
- Use the supplied weather data as the source of truth.
- Do not invent weather values.
- If the supplied data does not contain enough information to answer
  something, say so clearly.
- Keep answers concise and easy to understand.
- Use plain language rather than technical meteorological terminology.
- When useful, mention the specific weather values that support your answer.
- Do not claim certainty about future weather.
- Do not pretend to have access to weather information that was not supplied.
`,
    input: `
User's location:
${weather.location}

Weather data:
${JSON.stringify(weather, null, 2)}

User question:
${question}
`
  })

  return response.output_text
}