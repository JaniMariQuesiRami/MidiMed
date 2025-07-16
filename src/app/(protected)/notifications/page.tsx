'use client'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { listenToNotifications, markNotificationAsRead, markNotificationAsUnread, archiveNotification, unarchiveNotification } from '@/db/notifications'
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

  const markUnread = async (id: string) => {
    await markNotificationAsUnread(id)
  }

  const archive = async (id: string) => {
    await archiveNotification(id)
  }

  const unarchive = async (id: string) => {
    await unarchiveNotification(id)
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
            <li key={n.notificationId} className={`px-4 py-2 rounded-lg flex justify-between items-center gap-2 ${!n.isRead ? 'bg-primary/10' : 'bg-muted/10'}`}>
              <div className="flex items-center gap-3">
                {!n.isRead && (
                  <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                )}
                <div className={!n.isRead ? '' : 'ml-6'}>
                  <span className="font-medium">{n.title}</span>
                  <div className="text-xs text-muted-foreground">{n.body}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {!n.isRead && tab !== 'archived' && (
                  <ActionButton $variant="primary" onClick={() => markRead(n.notificationId)}>
                    Marcar como leída
                  </ActionButton>
                )}
                {n.isRead && tab !== 'archived' && (
                  <ActionButton $variant="secondary" onClick={() => markUnread(n.notificationId)}>
                    Marcar como no leída
                  </ActionButton>
                )}
                {tab !== 'archived' && (
                  <ActionButton $variant="secondary" onClick={() => archive(n.notificationId)}>
                    Archivar
                  </ActionButton>
                )}
                {tab === 'archived' && (
                  <ActionButton $variant="primary" onClick={() => unarchive(n.notificationId)}>
                    Desarchivar
                  </ActionButton>
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

const ActionButton = tw.button<{ $variant: 'primary' | 'secondary' }>`
  text-sm px-2 py-1 rounded-md transition-all duration-200 cursor-pointer
  hover:shadow-sm
  ${({ $variant }) => 
    $variant === 'primary' 
      ? 'text-primary hover:bg-primary/10' 
      : 'text-muted-foreground hover:bg-muted/90 hover:text-foreground'
  }
`
