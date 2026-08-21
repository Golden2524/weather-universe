export function calculateRainRisk(
  precipitationProbability: number,
  precipitation: number
): number {
  let score = precipitationProbability

  if (precipitation > 0) {
    score += 15
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}