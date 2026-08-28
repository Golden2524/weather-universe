import { Card } from "@/components/ui/card"

interface DailyForecastItem {
  date: string
  temperatureMax: number
  temperatureMin: number
  precipitationProbabilityMax: number
}

interface DailyForecastProps {
  days: DailyForecastItem[]
}

export function DailyForecast({
  days
}: DailyForecastProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <p className="text-sm font-medium text-blue-300">
          7-DAY FORECAST
        </p>

        <h2 className="mt-1 text-xl font-semibold">
          The week ahead
        </h2>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const date = new Date(day.date)

          return (
            <div
              key={day.date}
              className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] px-4 py-3"
            >
              <div>
                <p className="text-sm font-medium">
                  {date.toLocaleDateString(
                    undefined,
                    {
                      weekday: "short"
                    }
                  )}
                </p>

                <p className="text-xs text-white/40">
                  {date.toLocaleDateString(
                    undefined,
                    {
                      month: "short",
                      day: "numeric"
                    }
                  )}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium">
                  {Math.round(
                    day.temperatureMax
                  )}°
                  <span className="text-white/40">
                    {" "}
                    / {Math.round(
                      day.temperatureMin
                    )}°
                  </span>
                </p>

                <p className="mt-1 text-xs text-blue-300">
                  {Math.round(
                    day.precipitationProbabilityMax
                  )}% rain
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}