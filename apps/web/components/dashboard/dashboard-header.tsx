"use client"

import { useState } from "react"

import {
  searchLocations,
  type LocationResult
} from "@/lib/api"

import { Button } from "@/components/ui/button"

interface DashboardHeaderProps {
  location: string
  onLocationSelect?: (
    location: LocationResult
  ) => void
}

export function DashboardHeader({
  location,
  onLocationSelect
}: DashboardHeaderProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<
    LocationResult[]
  >([])

  const [isSearching, setIsSearching] =
    useState(false)

  const [error, setError] = useState<string | null>(
    null
  )

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()

    const trimmedQuery = query.trim()

    if (!trimmedQuery) {
      return
    }

    try {
      setIsSearching(true)
      setError(null)

      const locations =
        await searchLocations(trimmedQuery)

      setResults(locations)
    } catch {
      setError(
        "Unable to search locations. Please try again."
      )
    } finally {
      setIsSearching(false)
    }
  }

  function handleLocationSelect(
    selectedLocation: LocationResult
  ) {
    setQuery("")
    setResults([])

    onLocationSelect?.(selectedLocation)
  }

  return (
    <header className="relative flex flex-col gap-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-xl shadow-lg">
          ☁
        </div>

        <div>
          <p className="text-xs font-semibold tracking-[0.22em] text-blue-300">
            WEATHER UNIVERSE
          </p>

          <p className="mt-1 text-sm text-white/50">
            Exploring the atmosphere around {location}
          </p>
        </div>
      </div>

      <div className="relative w-full lg:max-w-md">
        <form
          onSubmit={handleSubmit}
          className="flex gap-2"
        >
          <input
            value={query}
            onChange={(event) =>
              setQuery(event.target.value)
            }
            placeholder="Search any city..."
            className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-blue-400/50 focus:bg-white/10"
          />

          <Button
            type="submit"
            disabled={isSearching}
          >
            {isSearching ? "Searching..." : "Search"}
          </Button>
        </form>

        {error && (
          <p className="mt-2 text-sm text-red-300">
            {error}
          </p>
        )}

        {results.length > 0 && (
          <div className="absolute right-0 top-full z-50 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 shadow-2xl backdrop-blur-xl">
            {results.map((result) => (
              <button
                key={result.id}
                type="button"
                onClick={() =>
                  handleLocationSelect(result)
                }
                className="flex w-full flex-col px-4 py-3 text-left transition hover:bg-white/10"
              >
                <span className="font-medium text-white">
                  {result.name}
                </span>

                <span className="mt-1 text-sm text-white/50">
                  {result.admin1
                    ? `${result.admin1}, `
                    : ""}
                  {result.country}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  )
}