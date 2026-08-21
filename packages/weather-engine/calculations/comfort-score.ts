export function calculateComfortScore(
  temperature: number,
  humidity: number,
  windSpeed: number
): number {
  let score = 100

  // Ideal temperature range: roughly 18°C–26°C
  if (temperature < 18) {
    score -= (18 - temperature) * 4
  }

  if (temperature > 26) {
    score -= (temperature - 26) * 4
  }

  // High humidity reduces comfort
  if (humidity > 60) {
    score -= (humidity - 60) * 0.7
  }

  // Strong winds can reduce comfort
  if (windSpeed > 25) {
    score -= (windSpeed - 25) * 0.5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}