// Streaming chat API route for the public patient portal.
// Validates tenant, checks billing & publicChatEnabled, then streams
// an AI response with tool-calling capabilities via Vercel AI SDK v6.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-2-C)
// - 2026-03-14: Added messages array validation, switched to gpt-4o-mini per tech stack (PHASE-4)

import { streamText, convertToModelMessages, stepCountIs } from "ai"
import { openai } from "@ai-sdk/openai"
import { adminDb } from "@/lib/firebase-admin"
import { buildSystemPrompt } from "@/app/api/chat/system-prompt"
import { buildChatTools } from "@/app/api/chat/tools"
import type { Tenant, TenantBillingStatus } from "@/types/db"

/** Billing statuses that allow access to the public chat. */
const ACTIVE_STATUSES: TenantBillingStatus[] = [
  "TRIAL_ACTIVE",
  "PAID_ACTIVE",
]

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages, clinicSlug } = body as {
      messages: unknown
      clinicSlug: string
    }

    if (!clinicSlug || typeof clinicSlug !== "string") {
      return Response.json(
        { error: "Missing or invalid clinicSlug" },
        { status: 400 },
      )
    }

    if (!Array.isArray(messages)) {
      return Response.json(
        { error: "Missing or invalid messages array" },
        { status: 400 },
      )
    }

    // Look up tenant by slug (doc ID)
    const tenantDoc = await adminDb
      .collection("tenants")
      .doc(clinicSlug)
      .get()

    if (!tenantDoc.exists) {
      return Response.json(
        { error: "Clinic not found" },
        { status: 404 },
      )
    }

    const tenant = tenantDoc.data() as Tenant

    // Validate billing status
    const billingStatus = tenant.billing?.status
    if (!billingStatus || !ACTIVE_STATUSES.includes(billingStatus)) {
      return Response.json(
        { error: "This clinic's chat is not currently active" },
        { status: 403 },
      )
    }

    // Validate publicChatEnabled
    if (tenant.settings.publicChatEnabled !== true) {
      return Response.json(
        { error: "Public chat is not enabled for this clinic" },
        { status: 403 },
      )
    }

    const currentDate = new Date().toISOString().split("T")[0]
    const tenantId = tenant.tenantId

    const modelMessages = await convertToModelMessages(
      messages as Parameters<typeof convertToModelMessages>[0],
    )

    const result = streamText({
      model: openai("gpt-4o-mini"),
      system: buildSystemPrompt(tenant, currentDate),
      messages: modelMessages,
      tools: buildChatTools(tenantId, tenant),
      stopWhen: stepCountIs(5),
    })

    return result.toUIMessageStreamResponse()
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error"
    console.error("[POST /api/chat] Error:", message)
    return Response.json({ error: message }, { status: 500 })
  }
}
