import { Card } from "@/components/ui/card"

interface WeatherDetailsProps {
  humidity: number
  windSpeed: number
  precipitation: number
  precipitationProbability: number
}

export function WeatherDetails({
  humidity,
  windSpeed,
  precipitation,
  precipitationProbability
}: WeatherDetailsProps) {
  return (
    <section>
      <div className="mb-4">
        <p className="text-sm font-medium text-blue-300">
          CURRENT CONDITIONS
        </p>

        <h2 className="mt-1 text-2xl font-semibold tracking-tight">
          Weather details
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5">
          <p className="text-sm text-white/50">Humidity</p>
          <p className="mt-3 text-3xl font-semibold">
            {Math.round(humidity)}%
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-white/50">Wind speed</p>
          <p className="mt-3 text-3xl font-semibold">
            {Math.round(windSpeed)} km/h
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-white/50">Precipitation</p>
          <p className="mt-3 text-3xl font-semibold">
            {precipitation} mm
          </p>
        </Card>

        <Card className="p-5">
          <p className="text-sm text-white/50">Rain probability</p>
          <p className="mt-3 text-3xl font-semibold">
            {Math.round(precipitationProbability)}%
          </p>
        </Card>
      </div>
    </section>
  )
}