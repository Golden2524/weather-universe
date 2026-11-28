import { Card } from "@/components/ui/card"
import { Droplets, Wind, CloudRain, Umbrella } from "lucide-react"

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
    <section aria-labelledby="weather-details-title">
      <div className="mb-4">
        <p className="text-[11px] font-semibold tracking-[.2em] text-amber-200/80">
          CURRENT CONDITIONS
        </p>

        <h2 id="weather-details-title" className="mt-1 text-2xl font-semibold tracking-tight">
          Weather details
        </h2>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
          <Droplets aria-hidden="true" className="h-5 w-5 text-sky-200" />
          <p className="mt-4 text-sm text-white/50">Humidity</p>
          <p className="mt-3 text-3xl font-semibold">
            {Math.round(humidity)}%
          </p>
        </Card>

        <Card className="p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
          <Wind aria-hidden="true" className="h-5 w-5 text-teal-200" />
          <p className="mt-4 text-sm text-white/50">Wind speed</p>
          <p className="mt-3 text-3xl font-semibold">
            {Math.round(windSpeed)} km/h
          </p>
        </Card>

        <Card className="p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
          <CloudRain aria-hidden="true" className="h-5 w-5 text-blue-200" />
          <p className="mt-4 text-sm text-white/50">Precipitation</p>
          <p className="mt-3 text-3xl font-semibold">
            {precipitation} mm
          </p>
        </Card>

        <Card className="p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.07]">
          <Umbrella aria-hidden="true" className="h-5 w-5 text-indigo-200" />
          <p className="mt-4 text-sm text-white/50">Rain probability</p>
          <p className="mt-3 text-3xl font-semibold">
            {Math.round(precipitationProbability)}%
          </p>
        </Card>
      </div>
    </section>
  )
}
