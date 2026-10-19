import { MapPin, Sparkles } from "lucide-react"

import { Card } from "@/components/ui/card"
import { formatTemperature, type TemperatureUnit } from "@/lib/temperature"
import { WeatherIcon } from "./weather-icon"

interface WeatherHeroProps {
  location: string
  country: string
  temperature: number
  feelsLike: number
  condition: string
  high: number
  low: number
  updatedAt: string
  temperatureUnit: TemperatureUnit
}

export function WeatherHero({ location, country, temperature, feelsLike, condition, high, low, updatedAt, temperatureUnit }: WeatherHeroProps) {
  const iconCondition = condition.toLowerCase().replace(/\s+/g, "-")

  return (
    <Card className="relative overflow-hidden border-white/[0.12] bg-[linear-gradient(120deg,rgba(22,34,48,.96),rgba(13,22,33,.92)_58%,rgba(34,32,28,.76))] p-6 shadow-[0_28px_100px_rgba(0,0,0,.3)] sm:p-9">
      <div className="absolute -right-12 -top-24 h-80 w-80 rounded-full bg-amber-300/[0.11] blur-[90px]" aria-hidden="true" />
      <div className="absolute bottom-[-12rem] left-[40%] h-72 w-72 rounded-full bg-sky-300/[0.08] blur-[90px]" aria-hidden="true" />
      <div className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[.2em] text-emerald-200/80">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.8)]" />
              LIVE CONDITIONS
            </div>
            <h2 className="mt-5 text-3xl font-semibold tracking-[-.04em] sm:text-5xl">{location}</h2>
            <div className="mt-3 flex items-center gap-2 text-white/55">
              <MapPin className="h-4 w-4 text-amber-200/80" />
              <WeatherIcon condition={iconCondition} className="h-5 w-5 text-amber-100" />
              <p className="text-base">{country} <span className="text-white/25">·</span> {condition}</p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-5 border-t border-white/[0.09] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="flex items-center gap-3">
              <WeatherIcon condition={iconCondition} className="h-12 w-12 text-amber-200 sm:h-16 sm:w-16" />
              <div>
                <p className="text-xs uppercase tracking-[.16em] text-white/45">Right now</p>
                <p className="mt-1 text-6xl font-semibold tracking-[-.07em] sm:text-8xl">{formatTemperature(temperature, temperatureUnit)}</p>
              </div>
            </div>
            <div className="pb-1 text-sm text-white/55">
              <p>Feels <span className="text-white">{formatTemperature(feelsLike, temperatureUnit)}</span></p>
              <p className="mt-2">High <span className="text-white">{formatTemperature(high, temperatureUnit)}</span></p>
              <p className="mt-1">Low <span className="text-white">{formatTemperature(low, temperatureUnit)}</span></p>
            </div>
          </div>
        </div>
        <p className="mt-6 flex items-center gap-2 text-xs text-white/40">
          <Sparkles className="h-3.5 w-3.5 text-amber-200/70" /> Updated at {new Date(updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </Card>
  )
}
