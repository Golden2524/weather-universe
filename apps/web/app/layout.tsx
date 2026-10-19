import type { Metadata } from "next"

import "./globals.css"

export const metadata: Metadata = {
  metadataBase: new URL("https://weather-universe-web-ew28.vercel.app"),

  title: {
    default: "Weather Universe",
    template: "%s | Weather Universe"
  },

  description:
    "A modern weather dashboard with live conditions, forecasts, weather intelligence, and an AI weather assistant.",

  applicationName: "Weather Universe",

  keywords: [
    "weather",
    "weather forecast",
    "live weather",
    "weather dashboard",
    "weather assistant",
    "Weather Universe"
  ],

  openGraph: {
    title: "Weather Universe",
    description:
      "Live weather, forecasts, weather intelligence, and an AI assistant in one dashboard.",
    type: "website",
    siteName: "Weather Universe",
    url: "https://weather-universe-web-ew28.vercel.app"
  },

  twitter: {
    card: "summary",
    title: "Weather Universe",
    description:
      "Live weather, forecasts, weather intelligence, and an AI weather assistant."
  },

  robots: {
    index: true,
    follow: true
  }
}

export default function RootLayout({
  children
}: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col">
        {children}
      </body>
    </html>
  )
}
