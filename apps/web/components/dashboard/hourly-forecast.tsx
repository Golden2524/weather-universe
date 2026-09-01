import { WeatherIcon } from "./weather-icon"

interface HourlyForecastProps {
  hourly: Array<{
    time: string
    temperature: number
    precipitationProbability: number
    condition: string
  }>
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
          The next 12 hours
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
        {forecast.map((hour) => (
          <div
            key={hour.time}
            className="rounded-3xl border border-white/10 bg-white/5 p-5"
          >
            <p className="text-sm text-white/50">
              {new Date(hour.time).toLocaleTimeString([], {
                hour: "numeric",
                minute: "2-digit"
              })}
            </p>

            <WeatherIcon
              condition={hour.condition}
              className="mt-4 h-6 w-6 text-blue-300"
            />

            <p className="mt-4 text-3xl font-semibold">
              {Math.round(hour.temperature)}°
            </p>

            <p className="mt-2 text-sm text-blue-300">
              {hour.precipitationProbability}% rain
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}