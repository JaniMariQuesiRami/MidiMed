/**
 * POST /api/ai/scribe — AI Medical Scribe API route.
 * Receives audio via multipart/form-data, transcribes with Whisper,
 * extracts structured medical fields with GPT-4o-mini, and returns results.
 *
 * Changelog:
 * - 2026-02-19: Initial creation (SCRIBE-002)
 */

import { NextRequest, NextResponse } from "next/server"

import { getAdminAuth } from "@/lib/ai/firebase-admin"
import {
  transcribeAudio,
  extractScribeFields,
  type CustomFieldDef,
} from "@/lib/ai/scribe-extraction"

/* ---------- Constants ---------- */

const MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024 // 25 MB
const ALLOWED_AUDIO_PREFIXES = ["audio/"]

/* ---------- Helpers ---------- */

type ScribeErrorCode =
  | "UNAUTHORIZED"
  | "AUDIO_TOO_LARGE"
  | "INVALID_AUDIO_FORMAT"
  | "MISSING_AUDIO"
  | "TRANSCRIPTION_FAILED"
  | "EXTRACTION_FAILED"

function errorResponse(
  status: number,
  error: ScribeErrorCode,
  transcript?: string | null
): NextResponse {
  return NextResponse.json(
    { success: false, error, transcript: transcript ?? null },
    { status }
  )
}

/**
 * Verifies a Firebase ID token from the Authorization header.
 * Returns the decoded token or null if invalid/missing.
 */
async function verifyAuthToken(
  request: NextRequest
): Promise<{ uid: string } | null> {
  const authHeader = request.headers.get("authorization")

  if (!authHeader?.startsWith("Bearer ")) {
    return null
  }

  const token = authHeader.slice(7)

  try {
    const adminAuth = getAdminAuth()
    const decoded = await adminAuth.verifyIdToken(token)
    return { uid: decoded.uid }
  } catch {
    return null
  }
}

/**
 * Parses and validates the customFields JSON string from the form data.
 * Returns an empty array if the field is missing or invalid.
 */
function parseCustomFields(raw: string | null): CustomFieldDef[] {
  if (!raw) return []

  try {
    const parsed = JSON.parse(raw)

    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (f: Record<string, unknown>) =>
        typeof f.key === "string" &&
        typeof f.label === "string" &&
        typeof f.type === "string" &&
        ["text", "number", "bool", "date"].includes(f.type as string)
    ) as CustomFieldDef[]
  } catch {
    return []
  }
}

/* ---------- Route handler ---------- */

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Step 1: Authenticate
  const user = await verifyAuthToken(request)

  if (!user) {
    return errorResponse(401, "UNAUTHORIZED")
  }

  // Step 2: Parse multipart form data
  let formData: FormData

  try {
    formData = await request.formData()
  } catch {
    return errorResponse(400, "MISSING_AUDIO")
  }

  const audioFile = formData.get("audio")

  if (!audioFile || !(audioFile instanceof File)) {
    return errorResponse(400, "MISSING_AUDIO")
  }

  // Step 3: Validate audio file
  if (audioFile.size > MAX_FILE_SIZE_BYTES) {
    return errorResponse(400, "AUDIO_TOO_LARGE")
  }

  const mimeType = audioFile.type
  const isValidAudio = ALLOWED_AUDIO_PREFIXES.some((prefix) =>
    mimeType.startsWith(prefix)
  )

  if (!isValidAudio) {
    return errorResponse(400, "INVALID_AUDIO_FORMAT")
  }

  // Step 4: Parse optional custom fields
  const customFieldsRaw = formData.get("customFields")
  const customFields = parseCustomFields(
    typeof customFieldsRaw === "string" ? customFieldsRaw : null
  )

  // Step 5: Transcribe audio with Whisper
  let transcript: string

  try {
    transcript = await transcribeAudio(audioFile)
  } catch (err) {
    console.error("[scribe] Whisper transcription failed:", (err as Error).message)
    return errorResponse(500, "TRANSCRIPTION_FAILED")
  }

  // Step 6: Extract structured fields with GPT-4o-mini
  try {
    const fields = await extractScribeFields(transcript, customFields)

    return NextResponse.json(
      { success: true, transcript, fields },
      { status: 200 }
    )
  } catch (err) {
    console.error("[scribe] Field extraction failed:", (err as Error).message)
    return errorResponse(500, "EXTRACTION_FAILED", transcript)
  }
}
