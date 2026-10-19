export type WeatherMood = "rain" | "storm" | "sunny" | "warm" | "cloudy" | "cool"

export interface WeatherPresentation {
  mood: WeatherMood
  conditionMessage: string
  temperatureMessage: string
  rainIntensity: "light" | "steady" | "heavy"
}

export function getWeatherPresentation(
  condition: string,
  temperature: number,
  precipitation: number,
  weatherCode: number,
  location: string
): WeatherPresentation {
  const normalized = condition.toLowerCase()
  const isThunderstorm = normalized.includes("thunder") || weatherCode >= 95
  const isDrizzle = normalized.includes("drizzle") || (weatherCode >= 51 && weatherCode <= 57)
  const isRain = isDrizzle || normalized.includes("rain") || [61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
  const isHeavyRain = [65, 67, 82].includes(weatherCode) || precipitation >= 7.6
  const isSunny = ["clear", "mainly-clear", "partly-cloudy"].includes(normalized) || weatherCode <= 2

  let mood: WeatherMood = "cool"
  if (isThunderstorm) mood = "storm"
  else if (isRain) mood = "rain"
  else if (isSunny) mood = "sunny"
  else if (temperature >= 25) mood = "warm"
  else if (normalized.includes("cloud") || normalized === "overcast") mood = "cloudy"

  let conditionMessage = `Conditions are ${normalized.replaceAll("-", " ")} in ${location}.`
  if (isThunderstorm) conditionMessage = `Thunderstorms are moving through ${location} now.`
  else if (isDrizzle) conditionMessage = `Light drizzle is falling in ${location} now.`
  else if (isHeavyRain) conditionMessage = `It’s raining heavily in ${location} now.`
  else if (isRain) conditionMessage = `It’s raining in ${location} now.`
  else if (isSunny) conditionMessage = `Clear skies and sunshine over ${location}.`
  else if (normalized.includes("partly-cloudy")) conditionMessage = `Sun and clouds are sharing the sky in ${location}.`
  else if (normalized.includes("overcast") || normalized.includes("cloud")) conditionMessage = `Mostly cloudy skies over ${location}.`
  else if (normalized.includes("fog")) conditionMessage = `Fog is reducing visibility around ${location}.`

  let temperatureMessage = "Cool right now"
  if (temperature >= 35) temperatureMessage = "Very hot right now"
  else if (temperature >= 30) temperatureMessage = "Hot right now"
  else if (temperature >= 25) temperatureMessage = "Warm, not too hot right now"
  else if (temperature >= 18) temperatureMessage = "Comfortable right now"
  else if (temperature >= 10) temperatureMessage = "Chilly right now"
  else if (temperature < 10) temperatureMessage = "Cold right now"

  const rainIntensity = isThunderstorm || isHeavyRain
    ? "heavy"
    : isDrizzle
      ? "light"
      : "steady"

  return { mood, conditionMessage, temperatureMessage, rainIntensity }
}
