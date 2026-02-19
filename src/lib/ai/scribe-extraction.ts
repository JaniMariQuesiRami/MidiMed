/**
 * AI Medical Scribe extraction pipeline: Zod schemas, Whisper transcription,
 * and GPT-4o-mini structured field extraction via Vercel AI SDK.
 *
 * Changelog:
 * - 2026-02-19: Initial creation (SCRIBE-002)
 */

import { generateObject } from "ai"
import { z } from "zod"

import { scribeModel } from "@/lib/ai/config"
import { getOpenAIClient } from "@/lib/ai/openai-client"

/* ---------- Types ---------- */

export type CustomFieldDef = {
  key: string
  label: string
  type: "text" | "number" | "bool" | "date"
}

/* ---------- Zod schemas ---------- */

export const scribeVitalsSchema = z.object({
  heightCm: z
    .number()
    .positive()
    .nullable()
    .describe("Altura del paciente en centimetros"),
  weightKg: z
    .number()
    .positive()
    .nullable()
    .describe("Peso del paciente en kilogramos"),
  bloodPressure: z
    .string()
    .nullable()
    .describe("Presion arterial en formato sistolica/diastolica (ej: 120/80)"),
  temperatureC: z
    .number()
    .nullable()
    .describe("Temperatura corporal en grados Celsius"),
})

export const scribeFieldsSchema = z.object({
  summary: z
    .string()
    .nullable()
    .describe(
      "Resumen narrativo del motivo de consulta y hallazgos principales"
    ),
  diagnosis: z.string().nullable().describe("Diagnostico clinico"),
  prescribedMedications: z
    .array(z.string())
    .nullable()
    .describe(
      "Lista de medicamentos prescritos con nombre, dosis y frecuencia"
    ),
  vitals: scribeVitalsSchema,
  followUpInstructions: z
    .string()
    .nullable()
    .describe("Instrucciones de seguimiento para el paciente"),
  notes: z
    .string()
    .nullable()
    .describe("Notas adicionales del medico"),
  extras: z
    .record(z.string(), z.unknown())
    .default({})
    .describe("Campos personalizados extraidos de la transcripcion"),
})

export type ScribeFields = z.infer<typeof scribeFieldsSchema>

/* ---------- Prompts ---------- */

const SYSTEM_PROMPT = `Eres un asistente de documentación médica. Tu tarea es extraer información clínica estructurada de una transcripción de audio de una consulta médica en español.

Reglas estrictas:
- Solo extrae información que esté EXPLÍCITAMENTE mencionada en la transcripción.
- NUNCA inventes, supongas o halucines datos que no estén en el texto.
- Si un campo no se menciona, devuelve null para ese campo.
- Los medicamentos deben incluir nombre, dosis y frecuencia cuando se mencionen.
- Los signos vitales deben usar las unidades correctas: cm para altura, kg para peso, °C para temperatura, formato "sistólica/diastólica" para presión arterial.
- Escribe en español profesional médico.
- El campo "summary" debe ser un resumen narrativo del motivo de consulta y hallazgos principales, no una copia literal de la transcripción.`

/**
 * Builds the custom fields section of the extraction prompt.
 * Describes each custom field so the LLM knows what to extract into extras.
 */
function buildCustomFieldsPrompt(customFields: CustomFieldDef[]): string {
  if (customFields.length === 0) return ""

  const fieldDescriptions = customFields
    .map((field, index) => {
      let typeDescription: string

      switch (field.type) {
        case "text":
          typeDescription = "texto libre (string)"
          break
        case "number":
          typeDescription = "valor numerico"
          break
        case "bool":
          typeDescription = "verdadero o falso (boolean)"
          break
        case "date":
          typeDescription = "fecha en formato YYYY-MM-DD"
          break
      }

      return `${index + 1}. Campo "${field.label}" (clave: "${field.key}", tipo: ${typeDescription})`
    })
    .join("\n")

  return `

Además de los campos estándar, extrae los siguientes campos personalizados y colócalos en el objeto "extras" usando la clave indicada:

${fieldDescriptions}

Si un campo personalizado no se menciona en la transcripción, no lo incluyas en extras.`
}

/**
 * Builds the full user prompt for extraction.
 */
function buildUserPrompt(
  transcript: string,
  customFields: CustomFieldDef[]
): string {
  const customFieldsSection = buildCustomFieldsPrompt(customFields)

  return `Transcripción de la consulta médica:

"""
${transcript}
"""

Extrae la información clínica estructurada de esta transcripción.${customFieldsSection}`
}

/* ---------- Whisper transcription ---------- */

/**
 * Transcribes an audio file using OpenAI Whisper API.
 * @param audioFile - The audio file (as a File/Blob) to transcribe
 * @returns The transcribed text in Spanish
 */
export async function transcribeAudio(audioFile: File): Promise<string> {
  const client = getOpenAIClient()

  const transcription = await client.audio.transcriptions.create({
    model: "whisper-1",
    file: audioFile,
    language: "es",
    response_format: "text",
  })

  // When response_format is "text", the API returns a plain string
  return transcription as unknown as string
}

/* ---------- Structured extraction ---------- */

/**
 * Extracts structured medical fields from a transcript using GPT-4o-mini.
 * Uses Vercel AI SDK's generateObject with Zod schema validation.
 *
 * @param transcript - The transcribed consultation text
 * @param customFields - Optional array of clinic-configured custom fields
 * @returns Structured ScribeFields matching the Zod schema
 */
export async function extractScribeFields(
  transcript: string,
  customFields: CustomFieldDef[] = []
): Promise<ScribeFields> {
  const { object } = await generateObject({
    model: scribeModel,
    schema: scribeFieldsSchema,
    system: SYSTEM_PROMPT,
    prompt: buildUserPrompt(transcript, customFields),
    maxRetries: 3,
  })

  return object
}
