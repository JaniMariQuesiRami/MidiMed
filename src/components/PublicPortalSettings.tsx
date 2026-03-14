// Public portal settings card — lets clinic admins toggle the public chat portal and copy the shareable link.
// Created: 2026-03-14

"use client"

import { useContext, useState } from "react"
import { UserContext } from "@/contexts/UserContext"
import { updatePublicChatEnabled } from "@/db/organization"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Copy, ExternalLink } from "lucide-react"
import { toast } from "sonner"

export default function PublicPortalSettings() {
  const { tenant } = useContext(UserContext)
  const [enabled, setEnabled] = useState(
    tenant?.settings?.publicChatEnabled ?? false,
  )
  const [loading, setLoading] = useState(false)

  if (!tenant) return null

  const isActivePlan =
    tenant.billing?.status === "TRIAL_ACTIVE" ||
    tenant.billing?.status === "PAID_ACTIVE"

  const portalUrl = `${window.location.origin}/c/${tenant.tenantId}`

  const handleToggle = async (checked: boolean) => {
    setLoading(true)
    const previous = enabled
    setEnabled(checked) // optimistic update
    try {
      await updatePublicChatEnabled(tenant.tenantId, checked)
      toast.success(
        checked ? "Portal público activado" : "Portal público desactivado",
      )
    } catch {
      setEnabled(previous) // revert
      toast.error("Error al actualizar el portal")
    } finally {
      setLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl)
      toast.success("Enlace copiado")
    } catch {
      toast.error("No se pudo copiar el enlace")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Portal Público</CardTitle>
        <CardDescription>
          Permite que tus pacientes agenden citas y se registren a través de un
          enlace público con asistente de IA.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Activar portal</p>
            {!isActivePlan && (
              <p className="text-xs text-muted-foreground">
                Disponible en planes activos
              </p>
            )}
          </div>
          <Switch
            checked={enabled}
            onCheckedChange={handleToggle}
            disabled={!isActivePlan || loading}
          />
        </div>

        {enabled && (
          <div className="flex items-center gap-2 rounded-lg bg-muted p-3">
            <code className="flex-1 truncate text-sm">{portalUrl}</code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={portalUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
