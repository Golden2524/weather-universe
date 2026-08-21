export function calculateOutdoorScore(
  comfortScore: number,
  rainRisk: number,
  windSpeed: number
): number {
  let score = comfortScore

  score -= rainRisk * 0.4

  if (windSpeed > 30) {
    score -= (windSpeed - 30) * 1.5
  }

  return Math.max(0, Math.min(100, Math.round(score)))
}