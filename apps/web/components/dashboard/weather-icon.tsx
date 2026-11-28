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
      return <Sun className={className} aria-hidden="true" focusable="false" />

    case "partly-cloudy":
      return <CloudSun className={className} aria-hidden="true" focusable="false" />

    case "overcast":
      return <Cloud className={className} aria-hidden="true" focusable="false" />

    case "fog":
      return <CloudFog className={className} aria-hidden="true" focusable="false" />

    case "drizzle":
    case "rain":
    case "rain-showers":
      return <CloudRain className={className} aria-hidden="true" focusable="false" />

    case "snow":
    case "snow-showers":
      return <CloudSnow className={className} aria-hidden="true" focusable="false" />

    case "thunderstorm":
      return <CloudLightning className={className} aria-hidden="true" focusable="false" />

    default:
      return <Cloud className={className} aria-hidden="true" focusable="false" />
  }
}
