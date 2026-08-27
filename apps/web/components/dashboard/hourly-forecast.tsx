import { Card } from "@/components/ui/card"

interface HourlyForecastItem {
  time: string
  temperature: number
  precipitationProbability: number
  condition: string
}

interface HourlyForecastProps {
  hourly: HourlyForecastItem[]
}

export function HourlyForecast({
  hourly
}: HourlyForecastProps) {
  const forecast = hourly.slice(0, 12)

  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-medium text-blue-300">
          HOURLY FORECAST
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          The next few hours
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {forecast.map((hour) => (
          <Card key={hour.time} className="p-5">
            <p className="text-sm text-white/50">
              {new Date(hour.time).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>

            <p className="mt-3 text-3xl font-semibold">
              {Math.round(hour.temperature)}°
            </p>

            <p className="mt-2 text-sm capitalize text-white/50">
              {hour.condition.replace("-", " ")}
            </p>

            <p className="mt-3 text-sm text-blue-300">
              Rain {Math.round(hour.precipitationProbability)}%
            </p>
          </Card>
        ))}
      </div>
    </section>
  )
}