'use client'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { getNotifications, markNotificationAsRead } from '@/db/notifications'
import type { Notification } from '@/types/db'
import tw from 'tailwind-styled-components'

export default function NotificationsPage() {
  const { user } = useContext(UserContext)
  const [items, setItems] = useState<Notification[]>([])

  useEffect(() => {
    if (!user) return
    getNotifications(user.uid).then(setItems).catch(() => {})
  }, [user])

  const markRead = async (id: string) => {
    await markNotificationAsRead(id)
    setItems((prev) => prev.filter((n) => n.notificationId !== id))
  }

  if (!user) return null

  return (
    <Wrapper>
      <h1 className="text-lg font-medium">Notificaciones</h1>
      <ul className="space-y-2">
        {items.map((n) => (
          <li key={n.notificationId} className="border p-2 rounded flex justify-between">
            <span>{n.title}</span>
            {!n.isRead && (
              <button className="text-sm text-primary" onClick={() => markRead(n.notificationId)}>
                Marcar como leída
              </button>
            )}
          </li>
        ))}
      </ul>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
