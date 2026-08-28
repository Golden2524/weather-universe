import { Card } from "@/components/ui/card"

interface WeatherHeroProps {
  location: string
  country: string
  temperature: number
  feelsLike: number
  condition: string
  high: number
  low: number
  updatedAt: string
}

export function WeatherHero({
  location,
  country,
  temperature,
  feelsLike,
  condition,
  high,
  low,
  updatedAt
}: WeatherHeroProps) {
  return (
    <Card className="relative overflow-hidden p-6 sm:p-10">
      <div className="absolute right-[-5%] top-[-25%] h-72 w-72 rounded-full bg-blue-400/20 blur-[100px]" />

      <div className="relative">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm text-white/50">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              LIVE CONDITIONS
            </div>

            <h2 className="mt-6 text-3xl font-semibold tracking-tight sm:text-5xl">
              {location}
            </h2>

            <p className="mt-2 text-base text-white/50">
              {country} · {condition}
            </p>
          </div>

          <div className="flex items-end gap-6">
            <div>
              <p className="text-sm text-white/50">
                Current temperature
              </p>

              <p className="mt-2 text-7xl font-semibold tracking-tighter sm:text-8xl">
                {Math.round(temperature)}°
              </p>
            </div>

            <div className="pb-2 text-sm text-white/50">
              <p>
                Feels like{" "}
                <span className="text-white">
                  {Math.round(feelsLike)}°
                </span>
              </p>

              <p className="mt-2">
                H{" "}
                <span className="text-white">
                  {Math.round(high)}°
                </span>
              </p>

              <p>
                L{" "}
                <span className="text-white">
                  {Math.round(low)}°
                </span>
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-white/40">
          Last updated{" "}
          {new Date(updatedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
          })}
        </p>

      </div>
    </Card>
  )
}