import test from "node:test"
import assert from "node:assert/strict"
import { getFrontendOrigins } from "../src/config/environment.js"

test("local development uses the localhost frontend origin by default", () => {
  assert.deepEqual(getFrontendOrigins({ NODE_ENV: "development" }), ["http://localhost:3000"])
})

test("production requires an explicit frontend origin", () => {
  assert.throws(() => getFrontendOrigins({ NODE_ENV: "production" }), /FRONTEND_URL must be configured in production/)
})

test("configured origins can allow multiple deployed frontend hosts", () => {
  assert.deepEqual(
    getFrontendOrigins({ NODE_ENV: "production", FRONTEND_URL: "https://weather.example.com, https://www.weather.example.com" }),
    ["https://weather.example.com", "https://www.weather.example.com"]
  )
})

test("normalizes a trailing slash without broadening the allowed origin", () => {
  assert.deepEqual(
    getFrontendOrigins({ NODE_ENV: "production", FRONTEND_URL: "https://weather.example.com/" }),
    ["https://weather.example.com"]
  )
})

test("rejects malformed origins and paths so CORS stays exact", () => {
  assert.throws(() => getFrontendOrigins({ FRONTEND_URL: "not-a-url" }), /invalid origin/)
  assert.throws(() => getFrontendOrigins({ NODE_ENV: "production", FRONTEND_URL: "https://weather.example.com/dashboard" }), /without paths/)
  assert.throws(() => getFrontendOrigins({ NODE_ENV: "production", FRONTEND_URL: "http://weather.example.com" }), /without paths/)
  assert.throws(() => getFrontendOrigins({ FRONTEND_URL: " , " }), /at least one allowed origin/)
})
