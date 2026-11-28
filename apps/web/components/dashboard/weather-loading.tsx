export function WeatherLoading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="flex animate-pulse flex-col gap-6 py-8"
    >
      <span className="sr-only">Loading weather forecast…</span>
      <div aria-hidden="true" className="contents">
        <div className="h-64 rounded-3xl border border-white/10 bg-white/5" />

        <div className="space-y-3">
          <div className="h-4 w-40 rounded bg-white/10" />
          <div className="h-8 w-80 max-w-full rounded bg-white/10" />
          <div className="h-4 w-full max-w-2xl rounded bg-white/5" />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="h-40 rounded-3xl border border-white/10 bg-white/5" />
          <div className="h-40 rounded-3xl border border-white/10 bg-white/5" />
          <div className="h-40 rounded-3xl border border-white/10 bg-white/5" />
        </div>
      </div>
    </div>
  )
}
