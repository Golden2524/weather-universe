import { MapPin, Sparkles } from "lucide-react"

import { Card } from "@/components/ui/card"
import { formatTemperature, type TemperatureUnit } from "@/lib/temperature"
import type { WeatherMood } from "@/lib/weather-presentation"
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
  mood: WeatherMood
  conditionMessage: string
  temperatureMessage: string
}

const moodStyles: Record<WeatherMood, { background: string; glow: string; icon: string; badge: string; temperature: string }> = {
  rain: {
    background: "linear-gradient(120deg, rgba(18,35,50,.98), rgba(11,24,36,.95) 56%, rgba(26,48,62,.9))",
    glow: "bg-sky-300/[0.15]",
    icon: "text-sky-100",
    badge: "border-sky-200/15 bg-sky-200/[0.07] text-sky-100/90",
    temperature: "border-sky-200/15 bg-sky-200/[0.06] text-sky-100/85"
  },
  storm: {
    background: "linear-gradient(120deg, rgba(27,24,43,.98), rgba(13,20,34,.96) 58%, rgba(31,34,49,.9))",
    glow: "bg-violet-300/[0.16]",
    icon: "text-violet-100",
    badge: "border-violet-200/15 bg-violet-200/[0.07] text-violet-100/90",
    temperature: "border-violet-200/15 bg-violet-200/[0.06] text-violet-100/85"
  },
  sunny: {
    background: "linear-gradient(120deg, rgba(42,34,27,.98), rgba(22,29,38,.95) 58%, rgba(51,39,27,.88))",
    glow: "bg-amber-300/[0.2]",
    icon: "text-amber-100",
    badge: "border-amber-200/15 bg-amber-200/[0.08] text-amber-100/90",
    temperature: "border-orange-200/15 bg-orange-200/[0.07] text-orange-100/85"
  },
  warm: {
    background: "linear-gradient(120deg, rgba(48,34,28,.98), rgba(22,28,36,.95) 58%, rgba(48,37,30,.9))",
    glow: "bg-orange-300/[0.19]",
    icon: "text-orange-100",
    badge: "border-orange-200/15 bg-orange-200/[0.08] text-orange-100/90",
    temperature: "border-orange-200/15 bg-orange-200/[0.08] text-orange-100/90"
  },
  cloudy: {
    background: "linear-gradient(120deg, rgba(30,39,47,.98), rgba(15,24,33,.95) 58%, rgba(36,43,48,.9))",
    glow: "bg-slate-200/[0.12]",
    icon: "text-slate-100",
    badge: "border-slate-200/15 bg-slate-200/[0.06] text-slate-100/90",
    temperature: "border-slate-200/15 bg-slate-200/[0.06] text-slate-100/85"
  },
  cool: {
    background: "linear-gradient(120deg, rgba(22,34,48,.98), rgba(13,22,33,.95) 58%, rgba(28,37,43,.9))",
    glow: "bg-cyan-300/[0.12]",
    icon: "text-cyan-100",
    badge: "border-cyan-200/15 bg-cyan-200/[0.06] text-cyan-100/90",
    temperature: "border-cyan-200/15 bg-cyan-200/[0.06] text-cyan-100/85"
  }
}

export function WeatherHero({ location, country, temperature, feelsLike, condition, high, low, updatedAt, temperatureUnit, mood, conditionMessage, temperatureMessage }: WeatherHeroProps) {
  const iconCondition = condition.toLowerCase().replace(/\s+/g, "-")
  const style = moodStyles[mood]

  return (
    <Card style={{ background: style.background }} className="relative overflow-hidden border-white/[0.12] p-6 shadow-[0_28px_100px_rgba(0,0,0,.3)] transition-colors duration-1000 sm:p-9">
      <div className={`absolute -right-12 -top-24 h-80 w-80 rounded-full ${style.glow} blur-[90px] transition-colors duration-1000`} aria-hidden="true" />
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
              <WeatherIcon condition={iconCondition} className={`h-5 w-5 ${style.icon}`} />
              <p className="text-base">{country} <span className="text-white/25">·</span> {condition}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <p className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm ${style.badge}`}>
                {conditionMessage}
              </p>
              <p className={`inline-flex items-center rounded-full border px-3.5 py-2 text-sm ${style.temperature}`}>
                {temperatureMessage}
              </p>
            </div>
          </div>
          <div className="flex items-center justify-between gap-5 border-t border-white/[0.09] pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <div className="flex items-center gap-3">
              <WeatherIcon condition={iconCondition} className={`h-12 w-12 ${style.icon} sm:h-16 sm:w-16`} />
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
