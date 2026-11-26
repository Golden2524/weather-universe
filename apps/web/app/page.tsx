"use client"

import { useEffect, useState } from "react"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { IntelligenceCard } from "@/components/dashboard/intelligence-card"
import { WeatherHero } from "@/components/dashboard/weather-hero"
import { WeatherDetails } from "@/components/dashboard/weather-details"
import { HourlyForecast } from "@/components/dashboard/hourly-forecast"
import { DailyForecast } from "@/components/dashboard/daily-forecast"
import { WeatherLoading } from "@/components/dashboard/weather-loading"
import { WeatherAssistant } from "@/components/dashboard/weather-assistant"
import { OutdoorPlanner } from "@/components/dashboard/outdoor-planner"
import { AppShell } from "@/components/layout/app-shell"

import {
  getBrowserLocation,
  getLocationFromCoordinates,
  getWeather,
  getWeatherInsights,
  type LocationResult
} from "@/lib/api"

import type { TemperatureUnit } from "@/lib/temperature"
import { getWeatherPresentation } from "@/lib/weather-presentation"

interface WeatherData {
  location: {
    timezone: string
  }
  current: {
    time: string
    temperature: number
    feelsLike: number
    humidity: number
    windSpeed: number
    precipitation: number
    precipitationProbability?: number
    uvIndex?: number
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

  const [temperatureUnit, setTemperatureUnit] =
    useState<TemperatureUnit>("C")

  const [preferencesLoaded, setPreferencesLoaded] =
    useState(false)

  const [weather, setWeather] =
    useState<WeatherData | null>(null)

  const [insights, setInsights] =
    useState<WeatherInsights | null>(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [isRefreshing, setIsRefreshing] =
    useState(false)

  const [error, setError] =
    useState<string | null>(null)

  useEffect(() => {
    async function initializePreferences() {
      const savedUnit =
        localStorage.getItem(
          "weather-temperature-unit"
        )

      if (savedUnit === "F") {
        setTemperatureUnit("F")
      } else {
        setTemperatureUnit("C")
      }

      const savedLocation =
        localStorage.getItem("weather-location")

      if (savedLocation) {
        try {
          const parsedLocation =
            JSON.parse(savedLocation) as LocationResult

          setSelectedLocation(parsedLocation)
          setPreferencesLoaded(true)

          return
        } catch {
          localStorage.removeItem(
            "weather-location"
          )
        }
      }

      try {
        const browserLocation =
          await getBrowserLocation()

        const detectedLocation =
          await getLocationFromCoordinates(
            browserLocation.latitude,
            browserLocation.longitude
          )

        if (detectedLocation) {
          setSelectedLocation(detectedLocation)

          localStorage.setItem(
            "weather-location",
            JSON.stringify(detectedLocation)
          )
        }
      } catch {
        // Location permission denied or detection failed.
        // Keep the default Lagos location.
      }

      setPreferencesLoaded(true)
    }

    initializePreferences()
  }, [])

  useEffect(() => {
    if (!preferencesLoaded) {
      return
    }

    localStorage.setItem(
      "weather-location",
      JSON.stringify(selectedLocation)
    )
  }, [selectedLocation, preferencesLoaded])

  useEffect(() => {
    if (!preferencesLoaded) {
      return
    }

    localStorage.setItem(
      "weather-temperature-unit",
      temperatureUnit
    )
  }, [temperatureUnit, preferencesLoaded])

  useEffect(() => {
    if (!preferencesLoaded) {
      return
    }

    async function loadWeather(
      showLoading = false,
      showRefreshing = false
    ) {
      try {
        if (showLoading) {
          setIsLoading(true)
        }

        if (showRefreshing) {
          setIsRefreshing(true)
        }

        setError(null)

        const weatherData = await getWeather(selectedLocation.latitude, selectedLocation.longitude)
        setWeather(weatherData)
        try {
          setInsights(await getWeatherInsights(selectedLocation.latitude, selectedLocation.longitude))
        } catch {
          setInsights(null)
        }
      } catch {
        setError(
          "Unable to load weather data. Please try again."
        )
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    }

    loadWeather(true)

    const interval = setInterval(() => {
      loadWeather(false)
    }, 300000)

    return () => clearInterval(interval)
  }, [selectedLocation, preferencesLoaded])

  async function handleRefresh() {
    try {
      setIsRefreshing(true)
      setError(null)

      const weatherData = await getWeather(selectedLocation.latitude, selectedLocation.longitude)
      setWeather(weatherData)
      try {
        setInsights(await getWeatherInsights(selectedLocation.latitude, selectedLocation.longitude))
      } catch {
        setInsights(null)
      }
    } catch {
      setError(
        "Unable to refresh weather data. Please try again."
      )
    } finally {
      setIsRefreshing(false)
    }
  }

  function handleLocationSelect(
    location: LocationResult
  ) {
    setSelectedLocation(location)

    localStorage.setItem(
      "weather-location",
      JSON.stringify(location)
    )
  }

  const assistantWeather =
    weather
      ? {
        location: selectedLocation.name,
        current: {
          temperature: weather.current.temperature,
          feelsLike: weather.current.feelsLike,
          humidity: weather.current.humidity,
          windSpeed: weather.current.windSpeed,
          precipitationProbability:
            weather.current.precipitationProbability ??
            weather.hourly[0]?.precipitationProbability ??
            0,
          uvIndex:
            weather.current.uvIndex ?? 0
        },
        hourly: weather.hourly,
        daily: weather.daily
      }
      : null

  const weatherPresentation = weather
    ? getWeatherPresentation(
        weather.current.condition,
        weather.current.temperature,
        weather.current.precipitation,
        weather.current.weatherCode,
        selectedLocation.name
      )
    : null

  if (!preferencesLoaded) {
    return (
      <AppShell mood={weatherPresentation?.mood} rainIntensity={weatherPresentation?.rainIntensity}>
        <div className="flex flex-1 items-center justify-center py-16">
          <WeatherLoading />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell mood={weatherPresentation?.mood} rainIntensity={weatherPresentation?.rainIntensity}>
      <DashboardHeader
        location={selectedLocation.name}
        onLocationSelect={handleLocationSelect}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        temperatureUnit={temperatureUnit}
        onTemperatureUnitChange={setTemperatureUnit}
      />

      <div className="flex flex-1 flex-col gap-8 py-7 sm:gap-10 sm:py-9">
        {isLoading && <WeatherLoading />}

        {error && (
          <div role="alert" className="rounded-3xl border border-red-400/20 bg-red-400/10 p-6 text-red-200">
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
              condition={formatCondition(
                weather.current.condition
              )}
              high={
                weather.daily?.[0]?.temperatureMax ??
                weather.current.temperature
              }
              low={
                weather.daily?.[0]?.temperatureMin ??
                weather.current.temperature
              }
              updatedAt={weather.updatedAt}
              temperatureUnit={temperatureUnit}
              mood={weatherPresentation?.mood ?? "cool"}
              conditionMessage={weatherPresentation?.conditionMessage ?? ""}
              temperatureMessage={weatherPresentation?.temperatureMessage ?? ""}
            />

            {insights && (
              <section>
                <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                  <p className="text-[11px] font-semibold tracking-[.2em] text-amber-200/80">
                    YOUR WEATHER BRIEFING
                  </p>

                  <h2 className="mt-1 text-2xl font-semibold tracking-tight">
                    Make the most of today.
                  </h2>
                  </div>
                  <p className="max-w-xl text-sm leading-6 text-white/50">{insights.summary}</p>
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

            <OutdoorPlanner
              hourly={weather.hourly}
              currentTime={weather.current.time}
              timezone={weather.location.timezone}
              temperatureUnit={temperatureUnit}
            />

            <HourlyForecast
              hourly={weather.hourly}
              timezone={weather.location.timezone}
              temperatureUnit={temperatureUnit}
            />

            <WeatherDetails
              humidity={weather.current.humidity}
              windSpeed={weather.current.windSpeed}
              precipitation={weather.current.precipitation}
              precipitationProbability={
                weather.hourly[0]
                  ?.precipitationProbability ?? 0
              }
            />

            {weather.daily && (
              <DailyForecast
                days={weather.daily}
                timezone={weather.location.timezone}
                temperatureUnit={temperatureUnit}
              />
            )}
          </>
        )}

        {assistantWeather && (
          <WeatherAssistant
            weather={assistantWeather}
          />
        )}
      </div>
    </AppShell>
  )
}
