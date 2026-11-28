export function getFrontendOrigins(environment: NodeJS.ProcessEnv = process.env): string[] {
  const configuredOrigins = environment.FRONTEND_URL

  if (!configuredOrigins && environment.NODE_ENV === "production") {
    throw new Error("FRONTEND_URL must be configured in production")
  }

  const origins = (configuredOrigins ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean)

  if (origins.length === 0) {
    throw new Error("FRONTEND_URL must contain at least one allowed origin")
  }

  const normalizedOrigins = origins.map((origin) => {
    let parsed: URL
    try {
      parsed = new URL(origin)
    } catch {
      throw new Error(`FRONTEND_URL contains an invalid origin: ${origin}`)
    }

    const isLocalHttp = parsed.protocol === "http:" && ["localhost", "127.0.0.1"].includes(parsed.hostname)
    if ((!isLocalHttp && parsed.protocol !== "https:") || parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) {
      throw new Error(`FRONTEND_URL values must be HTTPS origins without paths: ${origin}`)
    }

    return parsed.origin
  })

  return [...new Set(normalizedOrigins)]
}
