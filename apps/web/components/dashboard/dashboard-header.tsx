"use client"

import { useEffect, useState } from "react"
import { Search, MapPin, RefreshCw, CloudSun } from "lucide-react"

import {
  searchLocations,
  type LocationResult
} from "@/lib/api"

import type { TemperatureUnit } from "@/lib/temperature"

interface DashboardHeaderProps {
  onLocationSelect: (location: LocationResult) => void
  onRefresh: () => void
  isRefreshing: boolean
  temperatureUnit: TemperatureUnit
  onTemperatureUnitChange: (
    unit: TemperatureUnit
  ) => void
}

export function DashboardHeader({
  onLocationSelect,
  onRefresh,
  isRefreshing,
  temperatureUnit,
  onTemperatureUnitChange
}: DashboardHeaderProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    if (query.trim().length < 2) {
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true)

        const locations = await searchLocations(query, controller.signal)

        if (!controller.signal.aborted) setResults(locations)
      } catch {
        if (!controller.signal.aborted) setResults([])
      } finally {
        if (!controller.signal.aborted) setIsSearching(false)
      }
    }, 400)

    return () => {
      clearTimeout(timeout)
      controller.abort()
    }
  }, [query])

  function handleSelect(location: LocationResult) {
    onLocationSelect(location)

    setQuery("")
    setResults([])
  }

  return (
    <header className="relative flex flex-col gap-5 border-b border-white/[0.09] pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/[0.08] text-amber-200 shadow-[0_0_36px_rgba(244,184,95,.12)]">
          <CloudSun className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-amber-200/75">Weather Universe</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">Your daily forecast</h1>
        </div>
      </div>

      <div className="flex w-full max-w-2xl items-center gap-2 sm:gap-3">
          <div className="flex shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111a26] p-1">
          <button
            onClick={() => onTemperatureUnitChange("C")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${temperatureUnit === "C"
                ? "bg-amber-200 text-[#17202b]"
                : "text-white/50 hover:text-white"
              }`}
            aria-label="Use Celsius"
          >
            °C
          </button>

          <button
            onClick={() => onTemperatureUnitChange("F")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${temperatureUnit === "F"
                ? "bg-amber-200 text-[#17202b]"
                : "text-white/50 hover:text-white"
              }`}
            aria-label="Use Fahrenheit"
          >
            °F
          </button>
        </div>

        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh weather"
        >
          <RefreshCw
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""
              }`}
          />
        </button>

        <div className="relative min-w-0 flex-1">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-white/40" />

            <input
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value
                setQuery(nextQuery)
                setResults([])
                if (nextQuery.trim().length < 2) {
                  setIsSearching(false)
                }
              }}
              placeholder="Search a city..."
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-white/30"
            />
          </div>

          {(results.length > 0 || isSearching) && (
            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
              {isSearching && (
                <div className="px-4 py-3 text-sm text-white/50">
                  Searching...
                </div>
              )}

              {results.map((result) => (
                <button
                  key={result.id}
                  onClick={() => handleSelect(result)}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/5"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-blue-400" />

                  <div>
                    <p className="text-sm font-medium">
                      {result.name}
                    </p>

                    <p className="text-xs text-white/40">
                      {result.admin1
                        ? `${result.admin1}, `
                        : ""}
                      {result.country}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
