interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({
  children
}: AppShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#080d15] text-white">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -top-64 left-1/3 h-[620px] w-[620px] rounded-full bg-amber-400/[0.07] blur-[150px]" />
        <div className="absolute right-[-16%] top-[30%] h-[560px] w-[560px] rounded-full bg-sky-500/[0.08] blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1440px] flex-col px-4 py-5 sm:px-7 lg:px-10">
        {children}
        <footer className="mt-8 flex flex-col gap-2 border-t border-white/[0.08] py-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>WEATHER UNIVERSE <span className="text-white/20">·</span> A clearer view of your day</span>
          <span>Weather data refreshes automatically</span>
        </footer>
      </div>
    </main>
  )
}
