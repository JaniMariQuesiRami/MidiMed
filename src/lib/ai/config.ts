/**
 * Vercel AI SDK provider and model configuration for structured AI extraction.
 * Uses @ai-sdk/openai to create the provider and exports a default model instance.
 *
 * Changelog:
 * - 2026-02-19: Initial creation (SCRIBE-001)
 */

import { createOpenAI } from "@ai-sdk/openai"

/**
 * Vercel AI SDK OpenAI provider.
 * Reads OPENAI_API_KEY from server-side environment variables.
 * Only usable in server-side code (API routes, server components).
 */
export const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Default language model for structured extraction tasks (GPT-4o-mini).
 * Used with generateObject() from the ai package.
 */
export const scribeModel = openaiProvider("gpt-4o-mini")
