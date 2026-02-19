/**
 * Raw OpenAI client singleton for direct API calls (e.g., Whisper transcription).
 * Follows the singleton pattern from the backend's functions/src/helpers/openai.ts.
 *
 * Changelog:
 * - 2026-02-19: Initial creation (SCRIBE-001)
 */

import OpenAI from "openai"

let openaiClient: OpenAI | null = null

/**
 * Returns a singleton OpenAI client instance.
 * Reads OPENAI_API_KEY from server-side environment variables.
 * Throws if the API key is not configured.
 *
 * Only usable in server-side code (API routes).
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY environment variable is not set")
    }

    openaiClient = new OpenAI({ apiKey })
  }

  return openaiClient
}
