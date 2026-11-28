import { afterEach, describe, expect, it, vi } from "vitest"
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { WeatherHero } from "@/components/dashboard/weather-hero"
import { searchLocations } from "@/lib/api"

vi.mock("@/lib/api", () => ({ searchLocations: vi.fn() }))

afterEach(cleanup)

describe("Weather dashboard interactions", () => {
  it("renders weather status and converts the hero temperature to Fahrenheit", () => {
    render(<WeatherHero location="Abuja" country="Nigeria" temperature={30} feelsLike={32} condition="Rain" high={33} low={24} updatedAt="2026-11-26T12:00:00Z" temperatureUnit="F" mood="rain" conditionMessage="It’s raining in Abuja now." temperatureMessage="Hot right now" />)
    expect(screen.getByText("Abuja")).toBeTruthy()
    expect(screen.getByText("It’s raining in Abuja now.")).toBeTruthy()
    expect(screen.getByText("86°F")).toBeTruthy()
  })

  it("searches after debounce and returns a selected city", async () => {
    vi.mocked(searchLocations).mockResolvedValue([{ id: 1, name: "Abuja", country: "Nigeria", countryCode: "NG", latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos" }])
    const onLocationSelect = vi.fn()
    const user = userEvent.setup()
    render(<DashboardHeader onLocationSelect={onLocationSelect} onRefresh={vi.fn()} isRefreshing={false} temperatureUnit="C" onTemperatureUnitChange={vi.fn()} />)
    await user.type(
      screen.getByRole("combobox", {
        name: "Search for a city or location"
      }),
      "Abuja"
    )
    await waitFor(() => expect(searchLocations).toHaveBeenCalledWith("Abuja", expect.any(AbortSignal)), { timeout: 1500 })
    await user.click(await screen.findByText("Abuja"))
    expect(onLocationSelect).toHaveBeenCalledWith(expect.objectContaining({ name: "Abuja" }))
  })

  it("triggers refresh and changes temperature units", () => {
    const onRefresh = vi.fn()
    const onTemperatureUnitChange = vi.fn()
    render(<DashboardHeader onLocationSelect={vi.fn()} onRefresh={onRefresh} isRefreshing={false} temperatureUnit="C" onTemperatureUnitChange={onTemperatureUnitChange} />)
    fireEvent.click(screen.getByRole("button", { name: "Refresh weather" }))
    fireEvent.click(screen.getByRole("button", { name: "Use Fahrenheit" }))
    expect(onRefresh).toHaveBeenCalledOnce()
    expect(onTemperatureUnitChange).toHaveBeenCalledWith("F")
  })
})
