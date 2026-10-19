"use client"

import { useState } from "react"

import {
  askWeatherAssistant,
  type WeatherAssistantContext
} from "@/lib/api"

interface WeatherAssistantProps {
  weather: WeatherAssistantContext
}

const suggestedQuestions = [
  "Will I need an umbrella this afternoon?",
  "Why does it feel hotter than the temperature?",
  "What does the humidity mean?",
  "Explain the rain probability.",
  "What does the UV index mean?",
  "Compare today with tomorrow."
]

export function WeatherAssistant({
  weather
}: WeatherAssistantProps) {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAsk(questionToAsk = question) {
    const trimmedQuestion = questionToAsk.trim()

    if (!trimmedQuestion || isLoading) {
      return
    }

    setQuestion(trimmedQuestion)
    setAnswer(null)
    setError(null)
    setIsLoading(true)

    try {
      const response = await askWeatherAssistant(
        trimmedQuestion,
        weather
      )

      setAnswer(response)
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "The assistant is temporarily unavailable. Your weather dashboard is still working normally."
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault()
    void handleAsk()
  }

  function handleSuggestionClick(
    suggestion: string
  ) {
    setQuestion(suggestion)
    void handleAsk(suggestion)
  }

  function handleClear() {
    setQuestion("")
    setAnswer(null)
    setError(null)
  }

  return (
    <section
      aria-labelledby="weather-assistant-title"
      className="overflow-hidden rounded-3xl border border-amber-200/15 bg-gradient-to-br from-amber-200/[0.07] via-white/[0.035] to-white/[0.015] shadow-2xl shadow-black/10"
    >
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-amber-200/20 bg-amber-200/10"
                aria-hidden="true"
              >
                <span className="text-sm">✦</span>
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-200">
                Weather Universe AI
              </p>
            </div>

            <h2
              id="weather-assistant-title"
              className="mt-3 text-2xl font-semibold tracking-tight text-white"
            >
              Your weather, explained.
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Ask about the forecast, current conditions, or what
              any of the weather metrics on this dashboard mean.
            </p>
          </div>

          <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/40">
            {weather.location}
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-3 sm:flex-row"
        >
          <label
            htmlFor="weather-assistant-question"
            className="sr-only"
          >
            Ask Weather Universe a question
          </label>

          <input
            id="weather-assistant-question"
            type="text"
            value={question}
            onChange={(event) =>
              setQuestion(event.target.value)
            }
            placeholder="e.g. Will I need an umbrella this afternoon?"
            disabled={isLoading}
            autoComplete="off"
            className="min-h-12 min-w-0 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-400/50 focus:bg-black/30 focus:ring-2 focus:ring-blue-400/10 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={isLoading || !question.trim()}
            className="min-h-12 rounded-2xl bg-amber-200 px-6 text-sm font-semibold text-[#17202b] transition hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-amber-200/50 disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
          >
            {isLoading ? "Thinking..." : "Ask AI"}
          </button>
        </form>

        {!answer && !error && !isLoading && (
          <div className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/30">
                Try asking
              </p>

              <p className="hidden text-xs text-white/20 sm:block">
                Powered by your live dashboard data
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map(
                (suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() =>
                      handleSuggestionClick(
                        suggestion
                      )
                    }
                    className="rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2.5 text-left text-xs leading-4 text-white/55 transition hover:border-blue-400/30 hover:bg-blue-400/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  >
                    {suggestion}
                  </button>
                )
              )}
            </div>
          </div>
        )}

        {isLoading && (
          <div
            className="mt-6 rounded-2xl border border-blue-400/15 bg-blue-400/[0.05] p-5"
            aria-live="polite"
            aria-busy="true"
          >
            <div className="flex items-center gap-3">
              <div className="flex gap-1" aria-hidden="true">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300" />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300"
                  style={{ animationDelay: "150ms" }}
                />
                <span
                  className="h-1.5 w-1.5 animate-pulse rounded-full bg-blue-300"
                  style={{ animationDelay: "300ms" }}
                />
              </div>

              <p className="text-sm text-white/55">
                Looking at the weather data for{" "}
                <span className="font-medium text-white/80">
                  {weather.location}
                </span>
                ...
              </p>
            </div>
          </div>
        )}

        {answer && !isLoading && (
          <div
            className="mt-6 rounded-2xl border border-blue-400/20 bg-blue-400/[0.06] p-5"
            aria-live="polite"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-400/10 text-xs text-blue-300"
                  aria-hidden="true"
                >
                  ✦
                </div>

                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-300">
                  Weather Universe AI
                </span>
              </div>

              <button
                type="button"
                onClick={handleClear}
                className="self-start rounded-lg px-2 py-1 text-xs text-white/30 transition hover:bg-white/5 hover:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
              >
                Ask another
              </button>
            </div>

            <div className="mt-4 border-t border-white/5 pt-4">
              <p className="text-xs font-medium text-white/30">
                Your question
              </p>

              <p className="mt-1 text-sm text-white/50">
                {question}
              </p>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-white/80">
                {answer}
              </p>
            </div>
          </div>
        )}

        {error && !isLoading && (
          <div
            className="mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <div
                className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-xs text-amber-300"
                aria-hidden="true"
              >
                !
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium text-amber-200">
                  Assistant temporarily unavailable
                </p>

                <p className="mt-1 text-sm leading-6 text-white/45">
                  {error}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void handleAsk()
                    }
                    disabled={!question.trim()}
                    className="rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2 text-xs font-medium text-white/65 transition hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-400/30 disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    Try again
                  </button>

                  <button
                    type="button"
                    onClick={handleClear}
                    className="rounded-xl px-4 py-2 text-xs font-medium text-white/35 transition hover:bg-white/5 hover:text-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
