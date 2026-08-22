import { Card } from "@/components/ui/card"

interface IntelligenceCardProps {
  label: string
  score: number
  description: string
}

export function IntelligenceCard({
  label,
  score,
  description
}: IntelligenceCardProps) {
  const status =
    score >= 75
      ? "Excellent"
      : score >= 50
        ? "Moderate"
        : "Challenging"

  return (
    <Card className="p-5 sm:p-6">
      <p className="text-sm font-medium text-white/50">
        {label}
      </p>

      <div className="mt-5 flex items-end justify-between gap-4">
        <p className="text-5xl font-semibold tracking-tight">
          {score}
        </p>

        <p className="pb-2 text-sm text-blue-300">
          {status}
        </p>
      </div>

      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-white transition-all"
          style={{
            width: `${score}%`
          }}
        />
      </div>

      <p className="mt-4 text-sm leading-6 text-white/50">
        {description}
      </p>
    </Card>
  )
}