import { format } from 'date-fns'
import type { Appointment, TenantSettings } from '@/types/db'

export function getWorkingHoursForDate(
  settings: TenantSettings,
  date: Date,
): [string, string] | null {
  const map = {
    0: settings.workingHours.sun ?? null,
    1: settings.workingHours.mon,
    2: settings.workingHours.tue,
    3: settings.workingHours.wed,
    4: settings.workingHours.thu,
    5: settings.workingHours.fri,
    6: settings.workingHours.sat ?? null,
  } as const
  return map[date.getDay()] ?? null
}

export function generateTimeSlots(
  date: Date,
  existing: Appointment[],
  durationMinutes: number,
  stepMinutes = 10,
  ignoreId?: string,
  workingHours?: [string, string],
): string[] {
  const [startH, startM] = (workingHours?.[0] ?? '00:00').split(':').map(Number)
  const [endH, endM] = (workingHours?.[1] ?? '23:59').split(':').map(Number)

  const start = new Date(date)
  start.setHours(startH, startM, 0, 0)
  const endBoundary = new Date(date)
  endBoundary.setHours(endH, endM, 0, 0)

  const slots: string[] = []
  for (let cur = new Date(start); cur <= endBoundary; cur.setMinutes(cur.getMinutes() + stepMinutes)) {
    const slotStart = new Date(cur)
    const slotEnd = new Date(slotStart.getTime() + durationMinutes * 60000)
    if (slotEnd > endBoundary) break
    const overlap = existing.some((a) => {
      if (ignoreId && a.appointmentId === ignoreId) return false
      const apptStart = new Date(a.scheduledStart)
      const apptEnd = new Date(a.scheduledEnd)
      return slotStart < apptEnd && slotEnd > apptStart
    })
    if (!overlap) slots.push(format(slotStart, 'HH:mm'))
  }
  return slots
}
