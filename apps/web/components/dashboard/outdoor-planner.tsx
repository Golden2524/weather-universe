"use client"

import { useMemo, useState } from "react"
import { ArrowUpRight, Bike, Footprints, Sparkles, Wind } from "lucide-react"

import { Card } from "@/components/ui/card"
import { formatTemperature, type TemperatureUnit } from "@/lib/temperature"

type Activity = "walk" | "run" | "cycle"

interface ForecastHour {
  time: string
  temperature: number
  precipitationProbability: number
  windSpeed: number
  condition: string
}

interface OutdoorPlannerProps {
  hourly: ForecastHour[]
  currentTime: string
  temperatureUnit: TemperatureUnit
  timezone: string
}

const activities: Record<Activity, { label: string; target: number; description: string }> = {
  walk: { label: "Walk", target: 23, description: "Comfortable air and a lower chance of rain make for an easier outing." },
  run: { label: "Run", target: 18, description: "Cooler temperatures and calmer wind are better for a steady run." },
  cycle: { label: "Cycle", target: 21, description: "Look for a dry stretch with manageable wind for your ride." }
}

function forecastStamp(value: string) {
  return value.replace(" ", "T").slice(0, 16)
}

function formatForecastTime(value: string, timezone: string) {
  const date = new Date(`${forecastStamp(value)}:00Z`)
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    timeZone: timezone
  }).format(date)
}

function addForecastHour(value: string) {
  const date = new Date(`${forecastStamp(value)}:00Z`)
  date.setUTCHours(date.getUTCHours() + 1)
  return date.toISOString().slice(0, 16)
}

function getConditionFit(condition: string) {
  const normalized = condition.toLowerCase()
  if (normalized.includes("thunder")) return 10
  if (normalized.includes("snow")) return 35
  if (normalized.includes("rain") || normalized.includes("drizzle")) return 55
  if (normalized.includes("fog")) return 65
  return 100
}

function getHourScore(hour: ForecastHour, activity: Activity) {
  const target = activities[activity].target
  const temperatureFit = Math.max(0, 100 - Math.max(0, Math.abs(hour.temperature - target) - 4) * 7)
  const rainFit = Math.max(0, 100 - Math.max(0, hour.precipitationProbability) * 1.2)
  const windFit = Math.max(0, 100 - Math.max(0, hour.windSpeed - 12) * 4)
  const conditionFit = getConditionFit(hour.condition)

  return Math.round(temperatureFit * 0.35 + rainFit * 0.35 + windFit * 0.15 + conditionFit * 0.15)
}

function scoreLabel(score: number) {
  if (score >= 82) return "Great conditions"
  if (score >= 68) return "Good window"
  if (score >= 52) return "Mixed conditions"
  return "Consider another time"
}

export function OutdoorPlanner({ hourly, currentTime, temperatureUnit, timezone }: OutdoorPlannerProps) {
  const [activity, setActivity] = useState<Activity>("walk")

  const windows = useMemo(() => {
    const now = forecastStamp(currentTime)
    const upcoming = hourly
      .filter((hour) => forecastStamp(hour.time) >= now)
      .slice(0, 24)
    const ranked = []

    for (let index = 0; index < upcoming.length - 1; index += 1) {
      const hours = upcoming.slice(index, index + 2)
      const averageScore = Math.round(hours.reduce((sum, hour) => sum + getHourScore(hour, activity), 0) / hours.length)
      const averageTemperature = Math.round(hours.reduce((sum, hour) => sum + hour.temperature, 0) / hours.length)
      const averageWind = Math.round(hours.reduce((sum, hour) => sum + hour.windSpeed, 0) / hours.length)
      const rainChance = Math.max(...hours.map((hour) => hour.precipitationProbability))

      ranked.push({
        start: hours[0].time,
        end: addForecastHour(hours[1].time),
        score: averageScore,
        temperature: averageTemperature,
        wind: averageWind,
        rainChance
      })
    }

    const best: typeof ranked = []
    for (const window of ranked.sort((a, b) => b.score - a.score)) {
      const start = new Date(`${forecastStamp(window.start)}:00Z`).getTime()
      const spaced = best.every((selected) => Math.abs(start - new Date(`${forecastStamp(selected.start)}:00Z`).getTime()) >= 2 * 60 * 60 * 1000)
      if (spaced) best.push(window)
      if (best.length === 3) break
    }

    return best
  }, [activity, currentTime, hourly])

  const ActivityIcon = activity === "cycle" ? Bike : Footprints

  return (
    <section aria-labelledby="outdoor-planner-title">
      <Card className="overflow-hidden border-amber-200/[0.14] bg-[linear-gradient(130deg,rgba(28,34,37,.96),rgba(15,24,34,.92)_62%,rgba(38,33,24,.72))] p-5 sm:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[.2em] text-amber-200/80">
              <Sparkles className="h-4 w-4" /> WEATHER WINDOW PLANNER
            </div>
            <h2 id="outdoor-planner-title" className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Find your best time outside.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/50">Compare the next 24 forecast hours and pick a two-hour window that fits your plans.</p>
          </div>

          <div className="flex w-fit rounded-2xl border border-white/10 bg-black/20 p-1" role="group" aria-label="Choose an outdoor activity">
            {(["walk", "run", "cycle"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={activity === option}
                onClick={() => setActivity(option)}
                className={`rounded-xl px-3.5 py-2 text-sm font-medium capitalize transition ${activity === option ? "bg-amber-200 text-[#17202b]" : "text-white/50 hover:text-white"}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {windows.length ? (
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {windows.map((window, index) => (
              <article key={window.start} className={`rounded-2xl border p-4 ${index === 0 ? "border-amber-200/25 bg-amber-200/[0.07]" : "border-white/[0.08] bg-white/[0.025]"}`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-white/55">{index === 0 ? "Best match" : `Option ${index + 1}`}</p>
                  {index === 0 && <ArrowUpRight aria-hidden="true" className="h-4 w-4 text-amber-200" />}
                </div>
                <p className="mt-3 text-xl font-semibold tracking-tight">{formatForecastTime(window.start, timezone)} <span aria-hidden="true" className="text-white/55">—</span> {formatForecastTime(window.end, timezone)}</p>
                <p className="mt-1 text-xs text-emerald-200/80">{scoreLabel(window.score)} <span aria-hidden="true" className="text-white/55">·</span> {window.score}% fit</p>
                <div role="meter" aria-label="Weather fit" aria-valuemin={0} aria-valuemax={100} aria-valuenow={window.score} className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-gradient-to-r from-amber-300 to-emerald-200" style={{ width: `${window.score}%` }} />
                </div>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/50">
                  <span>{formatTemperature(window.temperature, temperatureUnit)} avg</span>
                  <span>{window.rainChance}% rain</span>
                  <span className="inline-flex items-center gap-1"><Wind className="h-3.5 w-3.5" /> {window.wind} km/h</span>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 text-sm text-white/55">There isn’t enough hourly forecast data to rank a two-hour window yet.</p>
        )}

        <div className="mt-5 flex items-start gap-3 border-t border-white/[0.08] pt-4">
          <ActivityIcon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/80" />
          <p className="text-xs leading-5 text-white/65">{activities[activity].description} The fit score is a planning aid based on forecast conditions, not a safety alert.</p>
        </div>
      </Card>
    </section>
  )
}
