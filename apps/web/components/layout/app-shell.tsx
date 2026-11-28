import type { WeatherMood } from "@/lib/weather-presentation"

interface AppShellProps {
  children: React.ReactNode
  mood?: WeatherMood
  rainIntensity?: "light" | "steady" | "heavy"
}

export function AppShell({
  children,
  mood = "cool",
  rainIntensity = "steady"
}: AppShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d15] text-white transition-colors duration-1000">
      <a
        href="#dashboard-content"
        className="absolute left-4 top-4 z-[100] -translate-y-20 rounded-xl bg-amber-200 px-4 py-3 font-semibold text-slate-950 shadow-xl transition-transform focus:translate-y-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        Skip to weather dashboard
      </a>
      <div className="weather-atmosphere pointer-events-none absolute inset-0" data-mood={mood} data-rain-intensity={rainIntensity} aria-hidden="true">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div id="dashboard-content" tabIndex={-1} className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-5 sm:px-7 lg:px-10">
        {children}
        <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.08] py-6 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <span>WEATHER UNIVERSE <span className="text-white/20">·</span> A clearer view of your day</span>
          <span>Weather data refreshes automatically</span>
        </footer>
      </div>
    </main>
  )
}
