// Public clinic chat portal — resolves tenant by slug and renders chat or error state.
// Changelog:
// - 2026-03-14: Initial creation (PHASE-3-A)

import { adminDb } from "@/lib/firebase-admin"
import ClinicNotFound from "./ClinicNotFound"
import ChatWindow from "./ChatWindow"

import type { Metadata } from "next"
import type { Tenant } from "@/types/db"

type PageProps = {
  params: Promise<{ clinicSlug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { clinicSlug } = await params
  const doc = await adminDb.collection("tenants").doc(clinicSlug).get()

  if (!doc.exists) {
    return { title: "Clínica no encontrada | MidiMed" }
  }

  const tenant = doc.data() as Tenant
  return {
    title: `${tenant.name} | Portal de Citas`,
    description: `Agenda tu cita en ${tenant.name} de forma rápida y sencilla.`,
  }
}

export default async function ClinicChatPage({ params }: PageProps) {
  const { clinicSlug } = await params

  // 1. Look up tenant by document ID (tenantId === clinicSlug)
  const doc = await adminDb.collection("tenants").doc(clinicSlug).get()

  if (!doc.exists) {
    return <ClinicNotFound reason="not-found" />
  }

  const tenant = doc.data() as Tenant

  // 2. Check billing status
  const billingStatus = tenant.billing?.status
  if (billingStatus !== "TRIAL_ACTIVE" && billingStatus !== "PAID_ACTIVE") {
    return <ClinicNotFound reason="inactive" />
  }

  // 3. Check portal enabled
  if (!tenant.settings?.publicChatEnabled) {
    return <ClinicNotFound reason="disabled" />
  }

  // 4. Render chat
  return (
    <ChatWindow
      tenantId={tenant.tenantId}
      clinicName={tenant.name}
      logoUrl={tenant.logoUrl}
    />
  )
}
