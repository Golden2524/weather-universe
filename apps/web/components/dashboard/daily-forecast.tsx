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
}

export function DailyForecast({
  days,
  temperatureUnit
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
    <Card className="border-white/[0.09] bg-[#111a26]/75 p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-[11px] font-semibold tracking-[.2em] text-amber-200/80">
          7-DAY FORECAST
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          The week ahead
        </h2>
      </div>

      <div className="space-y-3">
        {forecastDays.map((day) => {
          const date = new Date(day.date)

          return (
            <div
              key={day.date}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {date.toLocaleDateString(undefined, {
                    weekday: "short"
                  })}
                </p>

                <p className="text-xs text-white/40">
                  {date.toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric"
                  })}
                </p>
              </div>

              <div className="flex items-center gap-6">
                <WeatherIcon
                  condition={day.condition}
                className="h-6 w-6 text-amber-100"
                />

                <div className="text-right">
                  <p className="text-sm font-medium">
                    {formatTemperature(
                      day.temperatureMax,
                      temperatureUnit
                    )}
                    <span className="text-white/40">
                      {" "}
                      /{" "}
                      {formatTemperature(
                        day.temperatureMin,
                        temperatureUnit
                      )}
                    </span>
                  </p>

                  <p className="mt-1 text-xs text-sky-200/80">
                    {Math.round(
                      day.precipitationProbabilityMax
                    )}
                    % rain
                  </p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
