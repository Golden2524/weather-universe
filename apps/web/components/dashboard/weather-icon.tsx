import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Sun
} from "lucide-react"

interface WeatherIconProps {
  condition: string
  className?: string
}

export function WeatherIcon({
  condition,
  className = "h-6 w-6"
}: WeatherIconProps) {
  switch (condition) {
    case "clear":
    case "mainly-clear":
      return <Sun className={className} />

    case "partly-cloudy":
      return <CloudSun className={className} />

    case "overcast":
      return <Cloud className={className} />

    case "fog":
      return <CloudFog className={className} />

    case "drizzle":
    case "rain":
    case "rain-showers":
      return <CloudRain className={className} />

    case "snow":
    case "snow-showers":
      return <CloudSnow className={className} />

    case "thunderstorm":
      return <CloudLightning className={className} />

    default:
      return <Cloud className={className} />
  }
}