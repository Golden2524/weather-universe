import { test, expect } from "@playwright/test"

test("loads dashboard, changes units, searches a city and refreshes weather", async ({ page }) => {
  await page.route("**/health/**", (route) => route.fulfill({ json: { status: "ready" } }))
  await page.route("**/weather?**", (route) => route.fulfill({
    json: {
      location: { latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos" },
      current: { time: "2026-11-26T12:00", temperature: 30, feelsLike: 32, humidity: 74, precipitation: 0.4, weatherCode: 61, condition: "rain", windSpeed: 10, windDirection: 180, cloudCover: 75 },
      hourly: [], daily: [{ date: "2026-11-26", weatherCode: 61, condition: "rain", temperatureMax: 32, temperatureMin: 23, precipitationProbabilityMax: 70, sunrise: "2026-11-26T06:20", sunset: "2026-11-26T18:10" }],
      updatedAt: "2026-11-26T12:00:00.000Z"
    }
  }))
  await page.route("**/weather/insights?**", (route) => route.fulfill({ json: { summary: "Rain is likely today", scores: { comfort: 60, outdoor: 35, rainRisk: 80 }, highlights: ["Carry an umbrella"] } }))
  await page.route("**/location/search?**", (route) => route.fulfill({ json: { query: "Abuja", count: 1, results: [{ id: 1, name: "Abuja", country: "Nigeria", countryCode: "NG", latitude: 9.08, longitude: 7.49, timezone: "Africa/Lagos" }] } }))
  await page.goto("/")
  await expect(page.getByText("LIVE CONDITIONS")).toBeVisible()
  await page.getByRole("button", { name: "Use Fahrenheit" }).click()
  await expect(page.getByText("86°F")).toBeVisible()
  await page.getByRole("combobox", {
    name: "Search for a city or location"
  }).fill("Abuja")
  await page.getByText("Abuja", { exact: true }).last().click()
  await expect(page.getByText("It’s raining in Abuja now.")).toBeVisible()
  await page.getByRole("button", { name: "Refresh weather" }).click()
})
