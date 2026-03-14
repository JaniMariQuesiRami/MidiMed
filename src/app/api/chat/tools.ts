// Factory function that builds all 7 Firestore-backed AI tools for the public chat.
// Each tool operates within a single tenant context using Firebase Admin SDK.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-2-B)
// - 2026-03-14: Hardened timezone handling (Guatemala UTC-6), made phone optional in searchPatient, added empty-tenant guard (PHASE-4)

import { tool } from "ai"
import { z } from "zod"
import { FieldValue } from "firebase-admin/firestore"
import { getAdminDb } from "@/lib/firebase-admin"
import { phonesMatch } from "@/app/api/chat/phone-utils"
import type { Tenant, Patient, Appointment, User } from "@/types/db"

/** Guatemala timezone identifier. */
const GT_TZ = "America/Guatemala"

/** Formats a Date to HH:MM in Guatemala timezone. */
function toHHMM(d: Date): string {
  return d.toLocaleTimeString("en-GB", { timeZone: GT_TZ, hour: "2-digit", minute: "2-digit", hour12: false })
}

/** Formats a Date to YYYY-MM-DD in Guatemala timezone. */
function toDateStr(d: Date): string {
  return d.toLocaleDateString("sv-SE", { timeZone: GT_TZ })
}

/** Shape returned by every tool on failure. */
type ToolError = { success: false; error: string }

/**
 * Builds all chat tools scoped to a specific tenant.
 * Caches the provider lookup so it is only performed once per request.
 */
export function buildChatTools(tenantId: string, tenant: Tenant) {
  // ---- Cached provider lookup ----
  let cachedProvider: { uid: string; displayName: string } | null = null

  async function resolveProvider(): Promise<{
    uid: string
    displayName: string
  }> {
    if (cachedProvider) return cachedProvider

    const snap = await getAdminDb()
      .collection("users")
      .where("tenantId", "==", tenantId)
      .where("role", "in", ["provider", "admin"])
      .limit(1)
      .get()

    if (snap.empty) {
      throw new Error("No provider or admin user found for this tenant")
    }

    const doc = snap.docs[0]
    const user = doc.data() as User
    cachedProvider = { uid: user.uid, displayName: user.displayName }
    return cachedProvider
  }

  // ---- Helper: build ISO string from date + time (Guatemala TZ offset) ----
  function toISO(date: string, time: string): string {
    // Append seconds and explicit Guatemala offset (UTC-6) to avoid
    // ambiguous parsing that varies between JS engines.
    return new Date(`${date}T${time}:00-06:00`).toISOString()
  }

  // ================================================================
  // 1. searchPatient
  // ================================================================
  const searchPatient = tool({
    description:
      "Search for a patient by name and/or phone number. Use this to identify an existing patient in the system.",
    inputSchema: z.object({
      name: z
        .string()
        .describe("Patient name (first or last, partial match accepted)"),
      phone: z
        .string()
        .optional()
        .describe("Patient phone number in any format (optional)"),
    }),
    execute: async ({ name, phone }) => {
      try {
        const snap = await getAdminDb()
          .collection("patients")
          .where("tenantId", "==", tenantId)
          .get()

        if (snap.empty) {
          return { found: false }
        }

        const patients = snap.docs.map((d) => d.data() as Patient)

        // Filter by phone first (last 8 digits match)
        const phoneMatches = phone
          ? patients.filter((p) => p.phone && phonesMatch(p.phone, phone))
          : patients

        // Then filter by name (case-insensitive partial match)
        const nameLower = name.toLowerCase()
        const nameMatches = phoneMatches.filter((p) => {
          const full = `${p.firstName} ${p.lastName}`.toLowerCase()
          return full.includes(nameLower)
        })

        if (nameMatches.length === 1) {
          const p = nameMatches[0]
          return {
            found: true,
            patient: {
              id: p.patientId,
              firstName: p.firstName,
              lastName: p.lastName,
            },
          }
        }

        if (nameMatches.length > 1) {
          return {
            found: true,
            multiple: true,
            patients: nameMatches.map((p) => ({
              id: p.patientId,
              firstName: p.firstName,
              lastName: p.lastName,
            })),
          }
        }

        // If name didn't match exactly but phone did, report fuzzy
        if (phoneMatches.length === 1) {
          const p = phoneMatches[0]
          return {
            found: true,
            nameMatchFuzzy: true,
            patient: {
              id: p.patientId,
              firstName: p.firstName,
              lastName: p.lastName,
            },
          }
        }

        if (phoneMatches.length > 1) {
          return {
            found: true,
            nameMatchFuzzy: true,
            multiple: true,
            patients: phoneMatches.map((p) => ({
              id: p.patientId,
              firstName: p.firstName,
              lastName: p.lastName,
            })),
          }
        }

        return { found: false }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  // ================================================================
  // 2. getPatientAppointments
  // ================================================================
  const getPatientAppointments = tool({
    description:
      "Get upcoming scheduled appointments for a patient. Returns only future appointments sorted by date.",
    inputSchema: z.object({
      patientId: z.string().describe("The patient's ID"),
    }),
    execute: async ({ patientId }) => {
      try {
        const snap = await getAdminDb()
          .collection("appointments")
          .where("tenantId", "==", tenantId)
          .where("patientId", "==", patientId)
          .where("status", "==", "scheduled")
          .get()

        const now = new Date()
        const futureAppts = snap.docs
          .map((d) => d.data() as Appointment)
          .filter((a) => new Date(a.scheduledStart) > now)
          .sort(
            (a, b) =>
              new Date(a.scheduledStart).getTime() -
              new Date(b.scheduledStart).getTime(),
          )

        // Look up provider names
        const providerIds = [...new Set(futureAppts.map((a) => a.providerId))]
        const providerNames: Record<string, string> = {}

        for (const pid of providerIds) {
          const userDoc = await getAdminDb().collection("users").doc(pid).get()
          if (userDoc.exists) {
            const user = userDoc.data() as User
            providerNames[pid] = user.displayName
          } else {
            providerNames[pid] = "Desconocido"
          }
        }

        const appointments = futureAppts.map((a) => {
          const start = new Date(a.scheduledStart)
          const end = new Date(a.scheduledEnd)
          return {
            id: a.appointmentId,
            date: toDateStr(start),
            startTime: toHHMM(start),
            endTime: toHHMM(end),
            reason: a.reason,
            providerName: providerNames[a.providerId] ?? "Desconocido",
          }
        })

        return { appointments }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  // ================================================================
  // 3. getAvailableSlots
  // ================================================================
  const getAvailableSlots = tool({
    description:
      "Get available appointment time slots within a date range. Returns open slots based on clinic working hours minus already-booked appointments.",
    inputSchema: z.object({
      dateFrom: z
        .string()
        .describe("Start date in YYYY-MM-DD format"),
      dateTo: z
        .string()
        .describe("End date in YYYY-MM-DD format"),
    }),
    execute: async ({ dateFrom, dateTo }) => {
      try {
        const { workingHours, appointmentDurationMinutes } = tenant.settings
        const durationMs = appointmentDurationMinutes * 60 * 1000

        const from = new Date(`${dateFrom}T00:00:00-06:00`)
        const to = new Date(`${dateTo}T23:59:59-06:00`)

        // Limit range to 2 weeks
        const twoWeeksMs = 14 * 24 * 60 * 60 * 1000
        const effectiveTo = new Date(
          Math.min(to.getTime(), from.getTime() + twoWeeksMs),
        )

        const now = new Date()

        // Day-of-week mapping: JS getDay() => workingHours key
        const dayKeys: Record<number, keyof typeof workingHours> = {
          0: "sun",
          1: "mon",
          2: "tue",
          3: "wed",
          4: "thu",
          5: "fri",
          6: "sat",
        }

        // Generate all possible slots
        type Slot = { date: string; startTime: string; endTime: string }
        const allSlots: Slot[] = []

        const cursor = new Date(from)
        while (cursor <= effectiveTo) {
          const dayKey = dayKeys[cursor.getDay()]
          const hours = workingHours[dayKey]

          if (hours) {
            const [openStr, closeStr] = hours
            const dateStr = toDateStr(cursor)

            // Parse open/close with explicit Guatemala offset (UTC-6)
            const openTime = new Date(`${dateStr}T${openStr}:00-06:00`)
            const closeTime = new Date(`${dateStr}T${closeStr}:00-06:00`)

            let slotStart = new Date(openTime)
            while (slotStart.getTime() + durationMs <= closeTime.getTime()) {
              const slotEnd = new Date(slotStart.getTime() + durationMs)

              // Only include future slots
              if (slotEnd > now) {
                allSlots.push({
                  date: dateStr,
                  startTime: toHHMM(slotStart),
                  endTime: toHHMM(slotEnd),
                })
              }

              slotStart = slotEnd
            }
          }

          cursor.setDate(cursor.getDate() + 1)
        }

        // Fetch existing appointments in the range
        const apptSnap = await getAdminDb()
          .collection("appointments")
          .where("tenantId", "==", tenantId)
          .where("status", "==", "scheduled")
          .where("scheduledStart", ">=", from.toISOString())
          .where("scheduledStart", "<=", effectiveTo.toISOString())
          .get()

        const booked = new Set<string>()
        for (const doc of apptSnap.docs) {
          const a = doc.data() as Appointment
          const start = new Date(a.scheduledStart)
          const key = `${toDateStr(start)}_${toHHMM(start)}`
          booked.add(key)
        }

        // Subtract booked slots
        const available = allSlots.filter((s) => {
          const key = `${s.date}_${s.startTime}`
          return !booked.has(key)
        })

        return { slots: available }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  // ================================================================
  // 4. createAppointment
  // ================================================================
  const createAppointment = tool({
    description:
      "Create a new appointment for a patient. Auto-assigns a provider. Requires patient ID, date, time, and reason.",
    inputSchema: z.object({
      patientId: z.string().describe("The patient's ID"),
      date: z.string().describe("Appointment date in YYYY-MM-DD format"),
      startTime: z.string().describe("Start time in HH:MM format"),
      endTime: z.string().describe("End time in HH:MM format"),
      reason: z.string().describe("Reason or motive for the appointment"),
    }),
    execute: async ({ patientId, date, startTime, endTime, reason }) => {
      try {
        const provider = await resolveProvider()
        const docRef = getAdminDb().collection("appointments").doc()
        const appointmentId = docRef.id

        const appointmentData: Appointment = {
          tenantId,
          appointmentId,
          patientId,
          providerId: provider.uid,
          scheduledStart: toISO(date, startTime),
          scheduledEnd: toISO(date, endTime),
          status: "scheduled",
          reason,
          createdAt: new Date().toISOString(),
          createdBy: "public-chat",
        }

        await docRef.set(appointmentData)

        // Increment tenant appointment counter
        await getAdminDb()
          .collection("tenants")
          .doc(tenantId)
          .update({
            "counters.appointments": FieldValue.increment(1),
          })

        // Update patient's latestAppointmentId
        await getAdminDb()
          .collection("patients")
          .doc(patientId)
          .update({ latestAppointmentId: appointmentId })

        return { success: true, appointmentId }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  // ================================================================
  // 5. updateAppointment
  // ================================================================
  const updateAppointment = tool({
    description:
      "Reschedule an existing appointment to a new date and time. The appointment must belong to this clinic.",
    inputSchema: z.object({
      appointmentId: z.string().describe("The appointment ID to reschedule"),
      newDate: z.string().describe("New date in YYYY-MM-DD format"),
      newStartTime: z.string().describe("New start time in HH:MM format"),
      newEndTime: z.string().describe("New end time in HH:MM format"),
    }),
    execute: async ({ appointmentId, newDate, newStartTime, newEndTime }) => {
      try {
        const docRef = getAdminDb().collection("appointments").doc(appointmentId)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
          return { success: false, error: "Appointment not found" } as ToolError
        }

        const existing = docSnap.data() as Appointment
        if (existing.tenantId !== tenantId) {
          return { success: false, error: "Appointment not found" } as ToolError
        }

        await docRef.update({
          scheduledStart: toISO(newDate, newStartTime),
          scheduledEnd: toISO(newDate, newEndTime),
          updatedAt: new Date().toISOString(),
        })

        return { success: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  // ================================================================
  // 6. cancelAppointment
  // ================================================================
  const cancelAppointment = tool({
    description:
      "Cancel an existing appointment. The appointment must belong to this clinic.",
    inputSchema: z.object({
      appointmentId: z.string().describe("The appointment ID to cancel"),
    }),
    execute: async ({ appointmentId }) => {
      try {
        const docRef = getAdminDb().collection("appointments").doc(appointmentId)
        const docSnap = await docRef.get()

        if (!docSnap.exists) {
          return { success: false, error: "Appointment not found" } as ToolError
        }

        const existing = docSnap.data() as Appointment
        if (existing.tenantId !== tenantId) {
          return { success: false, error: "Appointment not found" } as ToolError
        }

        await docRef.update({
          status: "cancelled",
          updatedAt: new Date().toISOString(),
        })

        return { success: true }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  // ================================================================
  // 7. createPatient
  // ================================================================
  const createPatient = tool({
    description:
      "Register a new patient in the system. Requires basic personal information.",
    inputSchema: z.object({
      firstName: z.string().describe("Patient's first name"),
      lastName: z.string().describe("Patient's last name"),
      phone: z.string().describe("Patient's phone number"),
      birthDate: z
        .string()
        .describe("Date of birth in YYYY-MM-DD format"),
      sex: z
        .enum(["M", "F", "O"])
        .describe("Patient's sex: M (male), F (female), O (other)"),
      email: z
        .string()
        .optional()
        .describe("Patient's email address (optional)"),
    }),
    execute: async ({ firstName, lastName, phone, birthDate, sex, email }) => {
      try {
        const docRef = getAdminDb().collection("patients").doc()
        const patientId = docRef.id
        const now = new Date().toISOString()

        const patientData: Patient = {
          tenantId,
          patientId,
          firstName,
          lastName,
          phone,
          birthDate,
          sex,
          createdBy: "public-chat",
          createdAt: now,
          updatedAt: now,
          ...(email ? { email } : {}),
        }

        await docRef.set(patientData)

        // Increment tenant patient counter
        await getAdminDb()
          .collection("tenants")
          .doc(tenantId)
          .update({
            "counters.patients": FieldValue.increment(1),
          })

        return { success: true, patientId }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Unknown error"
        return { success: false, error: msg } as ToolError
      }
    },
  })

  return {
    searchPatient,
    getPatientAppointments,
    getAvailableSlots,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    createPatient,
  }
}
