interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({
  children
}: AppShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Atmospheric background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />

        <div className="absolute right-[-10%] top-[20%] h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px]" />

        <div className="absolute bottom-[-15%] left-[25%] h-[500px] w-[500px] rounded-full bg-cyan-400/10 blur-[140px]" />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  )
}