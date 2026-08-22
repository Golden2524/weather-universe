import type { HTMLAttributes } from "react"

import { cn } from "@/lib/utils"

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function Card({
  children,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl",
        "shadow-[0_20px_80px_rgba(0,0,0,0.25)]",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}