"use client"

import { useEffect, useState } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { IntelligenceCard } from "@/components/dashboard/intelligence-card"
import { WeatherHero } from "@/components/dashboard/weather-hero"
import { AppShell } from "@/components/layout/app-shell"
import { WeatherDetails } from "@/components/dashboard/weather-details"
import { HourlyForecast } from "@/components/dashboard/hourly-forecast"
import { DailyForecast } from "@/components/dashboard/daily-forecast"
import { WeatherLoading } from "@/components/dashboard/weather-loading"

import {
  getWeather,
  getWeatherInsights,
  type LocationResult
} from "@/lib/api"

interface WeatherData {
  current: {
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    precipitation: number
    weatherCode: number
    condition: string
  }

  hourly: Array<{
    time: string
    temperature: number
    feelsLike: number
    precipitationProbability: number
    precipitation: number
    weatherCode: number
    condition: string
    windSpeed: number
  }>

  daily: Array<{
    date: string
    weatherCode: number
    condition: string
    temperatureMax: number
    temperatureMin: number
    precipitationProbabilityMax: number
    sunrise: string
    sunset: string
  }>

  updatedAt: string
}

interface WeatherInsights {
  summary: string

  scores: {
    comfort: number
    outdoor: number
    rainRisk: number
  }

  highlights: string[]
}

const DEFAULT_LOCATION: LocationResult = {
  id: 2332459,
  name: "Lagos",
  country: "Nigeria",
  countryCode: "NG",
  latitude: 6.5244,
  longitude: 3.3792,
  timezone: "Africa/Lagos"
}

function formatCondition(condition: string) {
  return condition
    .split("-")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ")
}

export default function Home() {
  const [selectedLocation, setSelectedLocation] =
    useState<LocationResult>(DEFAULT_LOCATION)

  const [weather, setWeather] =
    useState<WeatherData | null>(null)

  const [insights, setInsights] =
    useState<WeatherInsights | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadWeather(showLoading = false) {
      try {
        if (showLoading) {
          setIsLoading(true)
        }

        setError(null)

        const [weatherData, insightsData] =
          await Promise.all([
            getWeather(
              selectedLocation.latitude,
              selectedLocation.longitude
            ),
            getWeatherInsights(
              selectedLocation.latitude,
              selectedLocation.longitude
            )
          ])

        setWeather(weatherData)
        setInsights(insightsData)
      } catch {
        setError(
          "Unable to load weather data. Please try again."
        )
      } finally {
        setIsLoading(false)
      }
    }

    loadWeather(true)

    const interval = setInterval(() => {
      loadWeather(false)
    }, 300000)

    return () => clearInterval(interval)
  }, [selectedLocation])

  function handleLocationSelect(
    location: LocationResult
  ) {
    setSelectedLocation(location)
  }

  return (
    <AppShell>
      <DashboardHeader
        location={selectedLocation.name}
        onLocationSelect={handleLocationSelect}
      />

      <div className="flex flex-1 flex-col gap-6 py-8">
        {isLoading && <WeatherLoading />}

        {error && (
          <div className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
            {error}
          </div>
        )}

        {!isLoading && !error && weather && (
          <>
            <WeatherHero
              location={selectedLocation.name}
              country={selectedLocation.country}
              temperature={weather.current.temperature}
              feelsLike={weather.current.feelsLike}
              condition={formatCondition(weather.current.condition)}
              high={
                weather.daily?.[0]?.temperatureMax ??
                weather.current.temperature
              }
              low={
                weather.daily?.[0]?.temperatureMin ??
                weather.current.temperature
              }

              updatedAt={weather.updatedAt}
            />

            {insights && (
              <section>
                <div className="mb-4">
                  <p className="text-sm font-medium text-blue-300">
                    WEATHER INTELLIGENCE
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    What does the atmosphere mean for you?
                  </h2>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
                    {insights.summary}
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <IntelligenceCard
                    label="Comfort"
                    score={insights.scores.comfort}
                    description={
                      insights.highlights[0] ??
                      "Comfort conditions are being analyzed."
                    }
                  />

                  <IntelligenceCard
                    label="Outdoor"
                    score={insights.scores.outdoor}
                    description={
                      insights.highlights[1] ??
                      "Outdoor conditions are being analyzed."
                    }
                  />

                  <IntelligenceCard
                    label="Rain Risk"
                    score={insights.scores.rainRisk}
                    description={
                      insights.highlights[2] ??
                      "Rain conditions are being analyzed."
                    }
                  />
                </div>
              </section>
            )}

            <HourlyForecast hourly={weather.hourly} />

            <WeatherDetails
              humidity={weather.current.humidity}
              windSpeed={weather.current.windSpeed}
              precipitation={weather.current.precipitation}
              precipitationProbability={
                weather.hourly[0]?.precipitationProbability ?? 0
              }
            />

            {weather.daily && (
              <DailyForecast days={weather.daily} />
            )}

          </>
        )}
      </div>
    </AppShell>
  )
}