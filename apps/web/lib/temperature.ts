export type TemperatureUnit = "C" | "F"

export function convertTemperature(
  temperature: number,
  unit: TemperatureUnit
) {
  if (unit === "F") {
    return (temperature * 9) / 5 + 32
  }

  return temperature
}

export function formatTemperature(
  temperature: number,
  unit: TemperatureUnit
) {
  return `${Math.round(
    convertTemperature(temperature, unit)
  )}°${unit}`
}