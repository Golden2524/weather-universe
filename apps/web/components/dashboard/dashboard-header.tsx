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
  const [searchError, setSearchError] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [activeResult, setActiveResult] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    if (query.trim().length < 2) {
      return
    }

    const timeout = setTimeout(async () => {
      try {
        setIsSearching(true)
        setSearchError(false)

        const locations = await searchLocations(query, controller.signal)

        if (!controller.signal.aborted) {
          setResults(locations)
          setActiveResult(0)
          setHasSearched(true)
        }
      } catch {
        if (!controller.signal.aborted) {
          setResults([])
          setSearchError(true)
          setHasSearched(true)
        }
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
    setIsSearching(false)
    setSearchError(false)
    setHasSearched(false)
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown" && results.length > 0) {
      event.preventDefault()
      setActiveResult((current) => (current + 1) % results.length)
    } else if (event.key === "ArrowUp" && results.length > 0) {
      event.preventDefault()
      setActiveResult((current) => (current - 1 + results.length) % results.length)
    } else if (event.key === "Enter" && results[activeResult]) {
      event.preventDefault()
      handleSelect(results[activeResult])
    } else if (event.key === "Escape") {
      setQuery("")
      setResults([])
      setIsSearching(false)
      setSearchError(false)
      setHasSearched(false)
    }
  }

  const searchStatus = query.trim().length < 2
    ? ""
    : isSearching
      ? "Searching locations."
      : searchError
        ? "Location search failed. Try again."
        : !hasSearched
          ? ""
          : results.length === 0
          ? "No locations found."
          : `${results.length} ${results.length === 1 ? "location" : "locations"} found.`

  const showSearchPanel = results.length > 0 || isSearching || searchError || (hasSearched && results.length === 0)

  return (
    <header className="relative flex flex-col gap-5 border-b border-white/[0.09] pb-6 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-center gap-3.5">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-amber-200/20 bg-amber-200/[0.08] text-amber-200 shadow-[0_0_36px_rgba(244,184,95,.12)]">
          <CloudSun aria-hidden="true" className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-amber-200/75">Weather Universe</p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">Your daily forecast</h1>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-wrap items-center gap-2 sm:gap-3">
        <div className="flex shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-[#111a26] p-1" role="group" aria-label="Temperature unit">
          <button
            type="button"
            onClick={() => onTemperatureUnitChange("C")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${temperatureUnit === "C"
                ? "bg-amber-200 text-[#17202b]"
                : "text-white/50 hover:text-white"
              }`}
            aria-label="Use Celsius"
            aria-pressed={temperatureUnit === "C"}
          >
            °C
          </button>

          <button
            type="button"
            onClick={() => onTemperatureUnitChange("F")}
            className={`rounded-xl px-3 py-2 text-sm font-medium transition ${temperatureUnit === "F"
                ? "bg-amber-200 text-[#17202b]"
                : "text-white/50 hover:text-white"
              }`}
            aria-label="Use Fahrenheit"
            aria-pressed={temperatureUnit === "F"}
          >
            °F
          </button>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          aria-busy={isRefreshing}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label={isRefreshing ? "Updating weather" : "Refresh weather"}
        >
          <RefreshCw
            aria-hidden="true"
            className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""
              }`}
          />
        </button>
        <span className="sr-only" role="status" aria-live="polite">
          {isRefreshing ? "Updating weather forecast." : ""}
        </span>

        <div className="relative w-full min-w-0 sm:flex-1">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />

            <input
              id="location-search"
              type="search"
              role="combobox"
              aria-label="Search for a city or location"
              aria-autocomplete="list"
              aria-expanded={results.length > 0}
              aria-controls={results.length > 0 ? "location-search-results" : undefined}
              aria-activedescendant={results.length > 0 ? `location-result-${activeResult}` : undefined}
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value
                setQuery(nextQuery)
                setResults([])
                setActiveResult(0)
                setSearchError(false)
                setHasSearched(false)
                setIsSearching(false)
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search a city or location"
              autoComplete="off"
              className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-white/55"
            />
          </div>

          <p className="sr-only" role="status" aria-live="polite">{searchStatus}</p>

          {showSearchPanel && (
            <div className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 shadow-2xl">
              {results.length === 0 && (
                <p className="px-4 py-3 text-sm text-white/70">
                  {isSearching ? "Searching locations…" : searchError ? "Location search failed. Try again." : "No locations found."}
                </p>
              )}
              {results.length > 0 && (
                <div id="location-search-results" role="listbox" aria-label="Location search results">
                  {results.map((result, index) => (
                    <div
                      id={`location-result-${index}`}
                      key={`${result.id}-${result.latitude}-${result.longitude}`}
                      role="option"
                      aria-selected={index === activeResult}
                      onMouseEnter={() => setActiveResult(index)}
                      onClick={() => handleSelect(result)}
                      className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-left transition ${index === activeResult ? "bg-white/10" : "hover:bg-white/5"}`}
                    >
                      <MapPin className="h-4 w-4 shrink-0 text-blue-300" aria-hidden="true" />
                      <div>
                        <p className="text-sm font-medium">{result.name}</p>
                        <p className="text-xs text-white/65">
                          {result.admin1 ? `${result.admin1}, ` : ""}{result.country}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
