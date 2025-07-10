'use client'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { listenToNotifications, markNotificationAsRead, archiveNotification } from '@/db/notifications'
import type { Notification } from '@/types/db'
import tw from 'tailwind-styled-components'

export default function NotificationsPage() {
  const { user, tenant } = useContext(UserContext)
  const [tab, setTab] = useState<'new' | 'archived'>('new')
  const [items, setItems] = useState<Notification[]>([])

  useEffect(() => {
    if (!user || !tenant) return
    const unsub = listenToNotifications(
      user.uid,
      tenant.tenantId,
      { archived: tab === 'archived' },
      (notifications) => setItems(notifications)
    )
    return () => unsub()
  }, [user, tenant, tab])

  const markRead = async (id: string) => {
    await markNotificationAsRead(id)
  }

  const archive = async (id: string) => {
    await archiveNotification(id)
  }

  if (!user) return null

  return (
    <Wrapper>
      <Tabs>
        <Tab $active={tab === 'new'} onClick={() => setTab('new')}>
          Nuevas
        </Tab>
        <Tab $active={tab === 'archived'} onClick={() => setTab('archived')}>
          Archivadas
        </Tab>
      </Tabs>
      <ul className="space-y-2">
        {items.length === 0 ? (
          <li className="text-muted-foreground text-sm p-4 text-center">No hay notificaciones</li>
        ) : (
          items.map((n) => (
            <li key={n.notificationId} className="border p-2 rounded flex justify-between items-center gap-2">
              <div>
                <span className="font-medium">{n.title}</span>
                <div className="text-xs text-muted-foreground">{n.body}</div>
              </div>
              <div className="flex gap-2">
                {!n.isRead && tab !== 'archived' && (
                  <button className="text-sm text-primary" onClick={() => markRead(n.notificationId)}>
                    Marcar como leída
                  </button>
                )}
                {tab !== 'archived' && (
                  <button className="text-sm text-muted-foreground" onClick={() => archive(n.notificationId)}>
                    Archivar
                  </button>
                )}
              </div>
            </li>
          ))
        )}
      </ul>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4`
const Tabs = tw.div`flex gap-4 border-b`
const Tab = tw.button<{ $active?: boolean }>`pb-2 text-sm font-medium transition-colors
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}`
