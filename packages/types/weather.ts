export type WeatherCondition =
  | "clear"
  | "mainly-clear"
  | "partly-cloudy"
  | "overcast"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "rain-showers"
  | "snow-showers"
  | "thunderstorm"
  | "unknown"

export interface WeatherLocation {
  latitude: number
  longitude: number
  timezone: string
}

export interface CurrentWeather {
  time: string
  temperature: number
  feelsLike: number
  humidity: number
  precipitation: number
  weatherCode: number
  condition: WeatherCondition
  windSpeed: number
  windDirection: number
  cloudCover: number
}

export interface HourlyWeather {
  time: string
  temperature: number
  feelsLike: number
  precipitationProbability: number
  precipitation: number
  weatherCode: number
  condition: WeatherCondition
  windSpeed: number
}

export interface DailyWeather {
  date: string
  weatherCode: number
  condition: WeatherCondition
  temperatureMax: number
  temperatureMin: number
  precipitationProbabilityMax: number
  sunrise: string
  sunset: string
}

export interface WeatherData {
  location: WeatherLocation
  current: CurrentWeather
  hourly: HourlyWeather[]
  daily: DailyWeather[]
  updatedAt: string
}