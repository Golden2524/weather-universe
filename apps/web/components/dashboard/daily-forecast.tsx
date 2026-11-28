import { Card } from "@/components/ui/card"
import {
  formatTemperature,
  type TemperatureUnit
} from "@/lib/temperature"

import { WeatherIcon } from "./weather-icon"

interface DailyForecastItem {
  date: string
  condition: string
  temperatureMax: number
  temperatureMin: number
  precipitationProbabilityMax: number
}

interface DailyForecastProps {
  days: DailyForecastItem[]
  temperatureUnit: TemperatureUnit
  timezone: string
}

export function DailyForecast({
  days,
  temperatureUnit,
  timezone
}: DailyForecastProps) {
  const forecastDays = days
    .filter(
      (day) =>
        day.date &&
        day.condition &&
        Number.isFinite(day.temperatureMax) &&
        Number.isFinite(day.temperatureMin)
    )
    .slice(0, 7)

  return (
    <section aria-labelledby="daily-forecast-title">
      <Card className="border-white/[0.09] bg-[#111a26]/75 p-5 sm:p-6">
        <div className="mb-6">
          <p className="text-[11px] font-semibold tracking-[.2em] text-amber-100">
            7-DAY FORECAST
          </p>

          <h2 id="daily-forecast-title" className="mt-1 text-xl font-semibold">
            The week ahead
          </h2>
        </div>

        <div className="space-y-3">
          {forecastDays.map((day) => {
            const date = new Date(`${day.date}T12:00:00Z`)

            return (
              <div
                key={day.date}
                className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium">
                    <time dateTime={day.date}>
                      {date.toLocaleDateString(undefined, {
                        weekday: "short",
                        timeZone: timezone
                      })}
                    </time>
                  </p>

                  <p className="text-xs text-white/65">
                    {date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      timeZone: timezone
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-6">
                  <WeatherIcon
                    condition={day.condition}
                    className="h-6 w-6 text-amber-100"
                  />
                  <span className="sr-only">{day.condition.replace(/-/g, " ")}</span>

                  <div className="text-right">
                    <p className="text-sm font-medium">
                      {formatTemperature(
                        day.temperatureMax,
                        temperatureUnit
                      )}
                      <span className="text-white/65">
                        {" "}/{" "}
                        {formatTemperature(
                          day.temperatureMin,
                          temperatureUnit
                        )}
                      </span>
                    </p>

                    <p className="mt-1 text-xs text-sky-100">
                      {Math.round(day.precipitationProbabilityMax)}% rain
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>
    </section>
  )
}
