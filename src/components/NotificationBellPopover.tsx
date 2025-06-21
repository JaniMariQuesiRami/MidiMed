'use client'
import { useEffect, useState } from 'react'
import { Bell } from 'lucide-react'
import { getNotifications, markNotificationAsRead } from '@/db/notifications'
import { useUser } from '@/contexts/UserContext'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'

export default function NotificationBellPopover() {
  const { user } = useUser()
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([] as Notification[])

  useEffect(() => {
    if (!user) return
    const load = async () => {
      setLoading(true)
      try {
        const list = await getNotifications(user.uid)
        setNotifications(list.filter((n) => !n.isRead).slice(0, 5))
      } catch (err) {
        toast.error('Error al cargar notificaciones')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user])

  const markRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id))
    } catch {
      toast.error('No se pudo marcar como leída')
    }
  }

  if (!user) return null

  return (
    <Wrapper onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <Bell size={20} />
      {open && (
        <Popover>
          {loading ? (
            <div className="p-2 text-sm">Cargando...</div>
          ) : notifications.length === 0 ? (
            <div className="p-2 text-sm">Sin notificaciones</div>
          ) : (
            notifications.map((n) => (
              <Item key={n.notificationId}>
                <span>{n.title}</span>
                <button className="text-xs text-primary" onClick={() => markRead(n.notificationId)}>
                  Marcar leída
                </button>
              </Item>
            ))
          )}
        </Popover>
      )}
    </Wrapper>
  )
}

const Wrapper = tw.div`relative`
const Popover = tw.div`absolute right-0 mt-2 w-64 rounded-md border bg-background shadow-lg z-50`
const Item = tw.div`flex justify-between items-center px-3 py-2 text-sm border-b last:border-0`

