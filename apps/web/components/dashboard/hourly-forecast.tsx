import {
  formatTemperature,
  type TemperatureUnit
} from "@/lib/temperature"

import { WeatherIcon } from "./weather-icon"

interface HourlyForecastProps {
  hourly: Array<{
    time: string
    temperature: number
    precipitationProbability: number
    condition: string
  }>
  temperatureUnit: TemperatureUnit
  timezone: string
}

export function HourlyForecast({
  hourly,
  temperatureUnit,
  timezone
}: HourlyForecastProps) {
  const forecast = hourly.slice(0, 12)

  return (
    <section aria-labelledby="hourly-forecast-title">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[.2em] text-amber-200/80">
          HOURLY FORECAST
        </p>

        <h2 id="hourly-forecast-title" className="mt-1 text-2xl font-semibold tracking-tight">
          Hour by hour
        </h2>
      </div>

      <div role="region" aria-label="12-hour forecast. Scroll horizontally to view each hour." tabIndex={0} className="flex snap-x gap-3 overflow-x-auto pb-3 focus-visible:rounded-2xl focus-visible:outline-2 focus-visible:outline-amber-200 [scrollbar-color:rgba(255,255,255,.35)_transparent] [scrollbar-width:thin]">
        {forecast.map((hour) => (
          <div
            key={hour.time}
            className="min-w-[128px] snap-start rounded-3xl border border-white/[0.09] bg-[#111a26]/80 p-4 transition hover:border-amber-200/25 hover:bg-white/[0.07] sm:min-w-[142px]"
          >
            <p className="text-sm text-white/65">
              <time dateTime={`${hour.time}:00`}>
                {new Date(`${hour.time}:00Z`).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                  timeZone: timezone
                })}
              </time>
            </p>

            <WeatherIcon
              condition={hour.condition}
              className="mt-4 h-6 w-6 text-amber-100"
            />
            <span className="sr-only">{hour.condition.replace(/-/g, " ")}</span>

            <p className="mt-4 text-3xl font-semibold">
              {formatTemperature(
                hour.temperature,
                temperatureUnit
              )}
            </p>

            <p className="mt-2 text-xs text-sky-100">
              {hour.precipitationProbability}% rain
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}
