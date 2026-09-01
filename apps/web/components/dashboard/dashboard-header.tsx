"use client"

import { useEffect, useState } from "react"
import { Search, MapPin, RefreshCw } from "lucide-react"

import {
  searchLocations,
  type LocationResult
} from "@/lib/api"

interface DashboardHeaderProps {
  location: string
  onLocationSelect: (location: LocationResult) => void
  onRefresh: () => void
  isRefreshing: boolean
}

export function DashboardHeader({
  location,
  onLocationSelect,
  onRefresh,
  isRefreshing
}: DashboardHeaderProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<LocationResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true)

        const locations = await searchLocations(query)

        setResults(locations)
      } catch {
        setResults([])
      } finally {
        setIsSearching(false)
      }
    }, 400)

    return () => clearTimeout(timeout)
  }, [query])

  function handleSelect(location: LocationResult) {
    onLocationSelect(location)

    setQuery("")
    setResults([])
  }

  return (
    <header className="relative flex items-center justify-between gap-4 border-b border-white/10 pb-6">
      <div>
        <p className="text-sm text-white/50">
          Atmospheric intelligence
        </p>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          {location}
        </h1>
      </div>

      <div className="flex w-full max-w-md items-center gap-3">
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

        <div className="relative w-full">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 text-white/40" />

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search a city..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
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
                  <MapPin className="h-4 w-4 text-blue-400" />

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