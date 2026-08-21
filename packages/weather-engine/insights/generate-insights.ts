import type { WeatherData } from "@weather-universe/types"

import { calculateComfortScore } from "../calculations/comfort-score"
import { calculateOutdoorScore } from "../calculations/outdoor-score"
import { calculateRainRisk } from "../calculations/rain-score"

export interface WeatherInsights {
  summary: string
  scores: {
    comfort: number
    outdoor: number
    rainRisk: number
  }
  highlights: string[]
}

export function generateWeatherInsights(
  weather: WeatherData
): WeatherInsights {
  const current = weather.current

  const nextHourRainProbability =
    weather.hourly[0]?.precipitationProbability ?? 0

  const comfort = calculateComfortScore(
    current.temperature,
    current.humidity,
    current.windSpeed
  )

  const rainRisk = calculateRainRisk(
    nextHourRainProbability,
    current.precipitation
  )

  const outdoor = calculateOutdoorScore(
    comfort,
    rainRisk,
    current.windSpeed
  )

  const highlights: string[] = []

  if (current.temperature >= 30) {
    highlights.push(
      "It's quite hot right now, so stay hydrated."
    )
  } else if (current.temperature <= 15) {
    highlights.push(
      "It's chilly outside, so consider wearing an extra layer."
    )
  } else {
    highlights.push(
      "Temperatures are currently fairly comfortable."
    )
  }

  if (current.humidity >= 75) {
    highlights.push(
      "High humidity may make it feel warmer than the actual temperature."
    )
  }

  if (rainRisk >= 60) {
    highlights.push(
      "Rain is likely, so carrying an umbrella is a good idea."
    )
  } else if (rainRisk >= 30) {
    highlights.push(
      "There is a moderate chance of rain later."
    )
  } else {
    highlights.push(
      "Rain is unlikely in the immediate forecast."
    )
  }

  if (current.windSpeed >= 30) {
    highlights.push(
      "Strong winds may affect outdoor activities."
    )
  }

  let summary = ""

  if (rainRisk >= 60) {
    summary = "Conditions are unsettled with a significant chance of rain."
  } else if (current.temperature >= 30) {
    summary = "Expect a warm day with potentially uncomfortable heat."
  } else if (comfort >= 75) {
    summary = "Conditions look generally comfortable for today."
  } else {
    summary = "Today's weather has mixed conditions worth keeping an eye on."
  }

  return {
    summary,
    scores: {
      comfort,
      outdoor,
      rainRisk
    },
    highlights
  }
}