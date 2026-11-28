import { expect, test, type Response } from "@playwright/test"

const WEATHER_PATH = "/weather"
const LOCATION_PATH = "/location/search"

test("deployed dashboard fetches real weather and location data from the API", async ({ page }) => {
  const apiResponses: Response[] = []
  page.on("response", (response) => {
    const path = new URL(response.url()).pathname
    if (path.endsWith(WEATHER_PATH) || path.endsWith(LOCATION_PATH)) apiResponses.push(response)
  })

  await page.goto("/")
  await expect(page.getByText("LIVE CONDITIONS")).toBeVisible()
  const weatherResponse = apiResponses.find((response) =>
    new URL(response.url()).pathname.endsWith(WEATHER_PATH) && response.status() === 200
  )
  expect(weatherResponse, "dashboard should receive a successful weather API response").toBeDefined()
  if (!weatherResponse) throw new Error("No successful weather API response was captured")
  expect(weatherResponse.status()).toBe(200)
  const initialWeather = await weatherResponse.json()
  expect(initialWeather.current).toEqual(expect.objectContaining({ temperature: expect.any(Number), condition: expect.any(String) }))
  const frontendOrigin = new URL(page.url()).origin
  const apiOrigin = new URL(weatherResponse.url()).origin
  expect(apiOrigin).not.toBe(frontendOrigin)
  await expect(page.getByRole("heading", { name: "Lagos", exact: true })).toBeVisible()

  await page.getByRole("combobox", {
    name: "Search for a city or location"
  }).fill("Abuja")
  await expect.poll(() => apiResponses.some((response) =>
    new URL(response.url()).pathname.endsWith(LOCATION_PATH) && response.url().includes("q=Abuja")
  ), { timeout: 30_000 }).toBe(true)
  const locationResponse = apiResponses.find((response) =>
    new URL(response.url()).pathname.endsWith(LOCATION_PATH) && response.url().includes("q=Abuja")
  )
  expect(locationResponse).toBeDefined()
  if (!locationResponse) throw new Error("No live city-search API response was captured")
  expect(locationResponse.status()).toBe(200)
  const searchResults = await locationResponse.json()
  expect(searchResults.results).toEqual(expect.arrayContaining([
    expect.objectContaining({ name: "Abuja", latitude: expect.any(Number), longitude: expect.any(Number) })
  ]))
  const abuja = searchResults.results.find((location: { name: string; admin1?: string }) =>
    location.name === "Abuja" && /fct|federal capital/i.test(location.admin1 ?? "")
  )
  expect(abuja, "location API should return Abuja in the Federal Capital Territory").toBeDefined()
  if (!abuja) throw new Error("The location API did not return the Abuja Federal Capital Territory result")

  const previousWeatherCount = apiResponses.filter((response) => new URL(response.url()).pathname.endsWith(WEATHER_PATH)).length
  console.log(
    "Visible buttons:",
    await page.getByRole("button").allTextContents()
  )
  await page
    .getByRole("listbox", { name: "Location search results" })
    .getByRole("option")
    .filter({ hasText: "Abuja" })
    .filter({ hasText: "FCT, Nigeria" })
    .first()
    .click()
  await expect.poll(() => apiResponses.filter((response) => new URL(response.url()).pathname.endsWith(WEATHER_PATH)).length, { timeout: 60_000 }).toBeGreaterThan(previousWeatherCount)
  const selectedWeatherResponse = apiResponses.filter((response) => new URL(response.url()).pathname.endsWith(WEATHER_PATH)).at(-1)
  expect(selectedWeatherResponse).toBeDefined()
  if (!selectedWeatherResponse) throw new Error("No weather response for the selected location was captured")
  expect(selectedWeatherResponse.status()).toBe(200)
  const selectedWeather = await selectedWeatherResponse.json()
  expect(selectedWeather.current.temperature).toEqual(expect.any(Number))
  expect(new URL(selectedWeatherResponse.url()).origin).toBe(apiOrigin)
  expect(Number(new URL(selectedWeatherResponse.url()).searchParams.get("lat"))).toBeCloseTo(abuja.latitude, 3)
  await expect(page.getByRole("heading", { name: "Abuja", exact: true })).toBeVisible()
})
