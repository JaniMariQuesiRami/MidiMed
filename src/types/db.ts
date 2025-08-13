import type { Timestamp } from 'firebase/firestore'

export type ExtraFieldType = 'text' | 'number' | 'bool' | 'date'

export type ExtraFieldDef = {
  key: string
  label: string
  type: ExtraFieldType
  collection: string // por ahora siempre "medicalRecords"
}

export type TenantSettings = {
  appointmentDurationMinutes: number
  workingHours: {
    mon: [string, string]
    tue: [string, string]
    wed: [string, string]
    thu: [string, string]
    fri: [string, string]
    sat?: [string, string]
    sun?: [string, string]
  }
  extraFields?: ExtraFieldDef[]
}

export type TenantCounters = {
  patients: number
  appointments: number
  medicalRecords: number
}

export type Tenant = {
  tenantId: string
  name: string
  createdAt: string
  email: string
  phone: string
  address: string
  logoUrl?: string
  settings: TenantSettings
  counters: TenantCounters
}

export type UserRole = "admin" | "provider" | "staff"

export type User = {
  tenantId: string
  uid: string
  email: string
  displayName: string
  role: UserRole
  createdAt: string
  lastLoginAt: string
  avatarUrl?: string
  invitedBy?: string
}

export type Patient = {
  tenantId: string
  patientId: string
  /** Nombre del paciente */
  firstName: string
  /** Apellido del paciente */
  lastName: string
  /** Fecha de nacimiento (YYYY-MM-DD) */
  birthDate: string
  sex: "M" | "F" | "O"
  email?: string
  phone?: string
  address?: string
  /** URL de la foto del paciente */
  photoUrl?: string
  /** Alergias registradas */
  allergies?: string
  /** Notas adicionales u observaciones */
  notes?: string
  /** AI-generated summary of patient's current state and medical history */
  summary?: string;
  createdBy: string
  createdAt: string
  /** Última actualización si existe */
  updatedAt?: string
  latestAppointmentId?: string
}

export type MedicalRecordAttachment = {
  fileName: string
  storagePath: string
}

export type MedicalRecordDetails = {
  heightCm?: number
  weightKg?: number
  bloodPressure?: string
  temperatureC?: number
  age?: number
  summary: string
  diagnosis?: string
  prescribedMedications?: string[]
  followUpInstructions?: string
  notes?: string
}

export type MedicalRecord = {
  tenantId: string
  recordId: string
  patientId: string
  summary: string
  details: MedicalRecordDetails
  createdAt: string
  createdBy: string
  attachments?: MedicalRecordAttachment[]
  appointmentId?: string
  extras: Record<string, string | number | boolean | null>
}

export type PatientFile = {
  tenantId: string
  fileId: string
  patientId: string
  name: string
  url: string
  storagePath: string
  uploadedAt: string
  uploadedBy: string
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled"

export type Appointment = {
  tenantId: string
  appointmentId: string
  patientId: string
  providerId: string
  scheduledStart: string
  scheduledEnd: string
  status: AppointmentStatus
  reason: string
  createdAt: string
  createdBy: string
  medicalRecordId?: string | null
}

export type NotificationType = "appointment_reminder"

export type Notification = {
  tenantId: string
  userId: string
  notificationId: string
  title: string
  body: string
  type?: NotificationType
  metadata?: Record<string, unknown>
  isRead: boolean
  archived: boolean
  createdAt: string
  expiresAt?: string
}

export type Invite = {
  tenantId: string
  inviteId: string
  email: string
  displayName: string
  role: UserRole
  invitedBy: string
  createdAt: string
  status: "pending" | "accepted" | "expired"
  expiresAt?: string
  tempPassword?: string // Contraseña temporal para el primer login
}

export type Billing = {
  tenantId: string
  plan: "basic" | "pro"
  subscriptionStart: string
  subscriptionEnd: string
  isActive: boolean
  paymentProvider: string
  paymentProviderSubscriptionId: string
  paymentProviderCustomerId: string
}

// Input types
export type PatientInput = Omit<
  Patient,
  | "tenantId"
  | "patientId"
  | "createdAt"
  | "createdBy"
  | "latestAppointmentId"
  | "updatedAt"
>

export type AppointmentInput = Omit<
  Appointment,
  "tenantId" | "appointmentId" | "createdAt" | "createdBy"
>

export type MedicalRecordInput = Omit<
  MedicalRecord,
  "tenantId" | "recordId" | "createdAt" | "createdBy" | "attachments"
>

export type OrganizationSettingsInput = Partial<
  Pick<Tenant, "name" | "email" | "phone" | "address" | "logoUrl" | "settings">
>

export type Lead = {
  leadId: string
  name: string
  email: string
  message?: string
  createdAt: unknown
  status: 'new' | 'contacted' | 'converted' | 'closed'
  source: 'contact-form' | 'other'
}

export type UtmCampaign = {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_term?: string
  utm_content?: string
  fullUrl: string
  createdAt: Timestamp
  userAgent?: string
  referer?: string
}

