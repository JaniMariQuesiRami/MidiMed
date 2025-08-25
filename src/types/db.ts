// Unified types for Firebase Functions (backend)
// Uses string dates as ISO strings for frontend compatibility.

import { Currency } from "./recurrente";

/* ---------- Extras & custom fields ---------- */
export type ExtraFieldType = "text" | "number" | "bool" | "date";

export type ExtraFieldDef = {
  key: string;
  label: string;
  type: ExtraFieldType;
  collection: string; // por ahora siempre "medicalRecords"
};

/* ---------- Tenant settings & counters ---------- */
export type TenantSettings = {
  appointmentDurationMinutes: number;
  workingHours: {
    mon: [string, string];
    tue: [string, string];
    wed: [string, string];
    thu: [string, string];
    fri: [string, string];
    sat?: [string, string];
    sun?: [string, string];
  };
  extraFields?: ExtraFieldDef[];
};

export type TenantCounters = {
  patients: number;
  appointments: number;
  medicalRecords: number;
};

/* ---------- Billing (nuevo modelo) ---------- */
export type TenantPlanType = "TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";

export type TenantBillingStatus =
  | "TRIAL_ACTIVE"
  | "TRIAL_EXPIRED"
  | "PAID_ACTIVE"
  | "PAST_DUE";

export type TenantBilling = {
  plan: TenantPlanType;
  trialStartAt?: string; // ISO
  trialDays?: number;
  purchasedAt?: string; // ISO
  paidThrough?: string; // ISO
  status: TenantBillingStatus;
  providerSubscriptionId?: string; // ID de la suscripción en Recurrente
  wantsToBuy?: TenantPlanType; // Plan that the tenant wants to buy
};

/* ---------- Billing (legacy / externo) ---------- */
export type Billing = {
  tenantId: string;
  plan: "basic" | "pro";
  subscriptionStart: string;
  subscriptionEnd: string;
  isActive: boolean;
  paymentProvider: string;
  paymentProviderSubscriptionId: string;
  paymentProviderCustomerId: string;
};

/* ---------- Core entities ---------- */
export type Tenant = {
  tenantId: string;
  name: string;
  createdAt: string; // ISO string
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
  specialties?: string[]; // Solo especialidades como array
  settings: TenantSettings;
  counters: TenantCounters;
  billing?: TenantBilling; // presente en el modelo nuevo
  providerSubscriptionId?: string; // ID de la suscripción en Recurrente (fuera de billing para evitar race conditions)
};

export type UserRole = "admin" | "provider" | "staff";

export type User = {
  tenantId: string;
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
  lastLoginAt: string;
  avatarUrl?: string;
  invitedBy?: string;
  color?: string;
};

export type Patient = {
  tenantId: string;
  patientId: string;
  /** Nombre del paciente */
  firstName: string;
  /** Apellido del paciente */
  lastName: string;
  /** Fecha de nacimiento (YYYY-MM-DD) */
  birthDate: string;
  sex: "M" | "F" | "O";
  email?: string;
  phone?: string;
  address?: string;
  /** URL de la foto del paciente */
  photoUrl?: string;
  /** Alergias registradas */
  allergies?: string;
  /** Notas adicionales u observaciones */
  notes?: string;
  /** AI-generated summary of patient's current state and medical history */
  summary?: string;
  createdBy: string;
  createdAt: string;
  /** Última actualización si existe */
  updatedAt?: string;
  latestAppointmentId?: string;
};

export type MedicalRecordAttachment = {
  fileName: string;
  storagePath: string;
};

export type MedicalRecordDetails = {
  heightCm?: number;
  weightKg?: number;
  bloodPressure?: string;
  temperatureC?: number;
  age?: number;
  summary: string;
  diagnosis?: string;
  prescribedMedications?: string[];
  followUpInstructions?: string;
  notes?: string;
};

export type MedicalRecord = {
  tenantId: string;
  recordId: string;
  patientId: string;
  summary: string;
  details: MedicalRecordDetails;
  createdAt: string;
  createdBy: string;
  attachments?: MedicalRecordAttachment[];
  appointmentId?: string;
  summaryPdf?: {
    docId: string;
    storagePath: string;
    downloadUrl: string;
    createdAt: string;
  };
  extras?: Record<string, string | number | boolean | null>;
};

export type PatientFile = {
  tenantId: string;
  fileId: string;
  patientId: string;
  name: string;
  url: string;
  storagePath: string;
  uploadedAt: string;
  uploadedBy: string;
};

export type AppointmentStatus = "scheduled" | "completed" | "cancelled";

export type Appointment = {
  tenantId: string;
  appointmentId: string;
  patientId: string;
  providerId: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: AppointmentStatus;
  reason: string;
  createdAt: string;
  createdBy: string;
  medicalRecordId?: string | null;
};

export type NotificationType = "appointment_reminder";

export type Notification = {
  tenantId: string;
  userId: string;
  notificationId: string;
  title: string;
  body: string;
  type?: NotificationType;
  metadata?: Record<string, unknown>;
  isRead: boolean;
  archived: boolean;
  createdAt: string;
  expiresAt?: string;
};

export type Invite = {
  tenantId: string;
  inviteId: string;
  email: string;
  displayName: string;
  role: UserRole;
  invitedBy: string;
  createdAt: string;
  status: "pending" | "accepted" | "expired";
  expiresAt?: string;
  tempPassword?: string; // Contraseña temporal para el primer login
};

export type PlanUpgradeRequest = {
  requestId: string;
  tenantId: string;
  userId: string;
  currentPlan: TenantPlanType;
  currentStatus: TenantBillingStatus;
  message: string;
  createdAt: string;
  handled: boolean;
};

/* ---------- Documents & summaries ---------- */
export type Document = {
  docId: string;
  tenantId: string;
  patientId: string;
  appointmentId: string;
  recordId: string;
  type: "appointment_summary_v1";
  storagePath: string;
  downloadUrl: string;
  sizeBytes: number;
  createdAt: string;
  createdBy: string;
};

export type AppointmentSummaryV1 = {
  paciente: {
    nombre: string;
    edad: number;
    sexo: string;
    alergias?: string;
  };
  doctora: {
    nombre: string;
    especialidad?: string;
  };
  clinica: {
    nombre: string;
    direccion?: string;
  };
  visita: {
    fecha: string;
    motivo: string;
    soap: {
      subjetivo: string;
      objetivo: string;
      analisis: string;
      plan: string;
    };
  };
  signosVitales?: {
    altura?: string;
    peso?: string;
    presionArterial?: string;
    temperatura?: string;
  };
  recetas: Array<{
    medicamento: string;
    dosis: string;
    frecuencia: string;
    duracion: string;
  }>;
  seguimiento: {
    proximaCita?: string;
    instrucciones: string;
  };
  notas?: string;
};

/* ---------- Inputs ---------- */
export type PatientInput = Omit<
  Patient,
  | "tenantId"
  | "patientId"
  | "createdAt"
  | "createdBy"
  | "latestAppointmentId"
  | "updatedAt"
>;

export type AppointmentInput = Omit<
  Appointment,
  "tenantId" | "appointmentId" | "createdAt" | "createdBy"
>;

export type MedicalRecordInput = Omit<
  MedicalRecord,
  | "tenantId"
  | "recordId"
  | "createdAt"
  | "createdBy"
  | "attachments"
  | "summaryPdf"
>;

export type OrganizationSettingsInput = Partial<
  Pick<Tenant, "name" | "email" | "phone" | "address" | "logoUrl" | "settings">
>;

/* ---------- Leads & marketing ---------- */
export type Lead = {
  leadId: string;
  name: string;
  email: string;
  message?: string;
  createdAt: unknown;
  status: "new" | "contacted" | "converted" | "closed";
  source: "contact-form" | "other";
};

export type UtmCampaign = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  fullUrl: string;
  createdAt: string; // ISO string
  userAgent?: string;
  referer?: string;
};

// Billing core
export type PaymentProvider = "recurrente";
export type InvoiceStatus =
  | "pending"
  | "paid"
  | "expired"
  | "canceled"
  | "failed";

export type Invoice = {
  invoiceId: string; // docId
  tenantId: string;
  product: TenantPlanType; // 'BASIC' | 'PRO' | etc.
  amount: number; // en centavos
  currency: Currency;
  periodStart: string; // ISO (inicio ciclo)
  periodEnd: string; // ISO (fin ciclo)
  status: InvoiceStatus;

  provider: PaymentProvider; // 'recurrente'
  providerLinkId: string; // id del payment link
  providerLinkUrl: string; // url del payment link
  providerPaymentId?: string; // id del pago al confirmar
  providerCheckoutId?: string; // id del checkout de Recurrente
  providerSubscriptionId?: string; // id de la suscripción si aplica

  createdAt: string; // ISO
  dueAt: string; // ISO (vencimiento)
  paidAt?: string; // ISO
  canceledAt?: string; // ISO
  expiredAt?: string; // ISO

  // Datos útiles para conciliación/UX
  description?: string; // "Plan BASIC mensual Sep 2025"
  metadata?: Record<string, string>;
};

// Evento de webhook (auditoría / idempotencia)
export type PaymentEvent = {
  eventId: string; // id del evento del proveedor
  provider: PaymentProvider; // 'recurrente'
  type: string; // p.ej. 'payment.succeeded'
  receivedAt: string; // ISO
  verified: boolean; // firma válida

  tenantId?: string;
  invoiceId?: string;
  linkId?: string;
  paymentId?: string;

  payload: unknown; // cuerpo crudo/minimizado para trazabilidad
};

// Opcional: catálogo de planes (si quieres persistir precios)
export type PlanCatalog = {
  plan: TenantPlanType; // 'BASIC' | 'PRO' | ...
  currency: Currency;
  price: number; // en centavos
  active: boolean;
  updatedAt: string; // ISO
  // IDs de Recurrente para crear checkouts
  recurrenteProductId: string; // prod_nifhhlhb
  recurrentePriceId: string; // price_0evptk9w
  // Información adicional del producto
  productName?: string;
  productDescription?: string;
};
