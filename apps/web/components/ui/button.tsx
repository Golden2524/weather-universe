import type { ButtonHTMLAttributes } from "react"

import { cn } from "@/lib/utils"

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
}

export function Button({
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-2xl px-4 py-2",
        "text-sm font-medium transition-all duration-200",
        "bg-white text-slate-950",
        "hover:scale-[1.02] hover:bg-white/90",
        "active:scale-[0.98]",
        "disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
}