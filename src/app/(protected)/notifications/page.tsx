'use client'
import { useContext, useEffect, useState } from 'react'
import { UserContext } from '@/contexts/UserContext'
import { listenToNotifications, markNotificationAsRead, markNotificationAsUnread, archiveNotification, unarchiveNotification } from '@/db/notifications'
import type { Notification } from '@/types/db'
import { Button } from '@/components/ui/button'
import { Archive, ArchiveX, CheckCheck, Bell } from 'lucide-react'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'

export default function NotificationsPage() {
  const { user, tenant } = useContext(UserContext)
  const [tab, setTab] = useState<'new' | 'archived'>('new')
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)

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

  // Bulk actions
  const markAllAsRead = async () => {
    if (items.length === 0) return
    
    setLoading(true)
    try {
      const unreadItems = items.filter(item => !item.isRead)
      await Promise.all(unreadItems.map(item => markNotificationAsRead(item.notificationId)))
      toast.success(`${unreadItems.length} notificaciones marcadas como leídas`)
    } catch (error) {
      toast.error('Error al marcar las notificaciones como leídas')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const archiveAll = async () => {
    if (items.length === 0) return
    
    setLoading(true)
    try {
      await Promise.all(items.map(item => archiveNotification(item.notificationId)))
      toast.success(`${items.length} notificaciones archivadas`)
    } catch (error) {
      toast.error('Error al archivar las notificaciones')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const unarchiveAll = async () => {
    if (items.length === 0) return
    
    setLoading(true)
    try {
      await Promise.all(items.map(item => unarchiveNotification(item.notificationId)))
      toast.success(`${items.length} notificaciones desarchivadas`)
    } catch (error) {
      toast.error('Error al desarchivar las notificaciones')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const unreadCount = items.filter(item => !item.isRead).length

  if (!user) return null

  return (
    <Wrapper>
      <Header>
        <Tabs>
          <Tab $active={tab === 'new'} onClick={() => setTab('new')}>
            Nuevas {tab === 'new' && unreadCount > 0 && (
              <Badge>{unreadCount}</Badge>
            )}
          </Tab>
          <Tab $active={tab === 'archived'} onClick={() => setTab('archived')}>
            Archivadas
          </Tab>
        </Tabs>
        
        {/* Bulk Actions */}
        {items.length > 0 && (
          <BulkActions>
            {tab === 'new' && (
              <>
                {unreadCount > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={markAllAsRead}
                    disabled={loading}
                    className="flex items-center gap-2"
                  >
                    <CheckCheck className="h-4 w-4" />
                    Marcar todas como leídas ({unreadCount})
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={archiveAll}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Archive className="h-4 w-4" />
                  Archivar todas ({items.length})
                </Button>
              </>
            )}
            
            {tab === 'archived' && (
              <Button
                variant="outline"
                size="sm"
                onClick={unarchiveAll}
                disabled={loading}
                className="flex items-center gap-2"
              >
                <ArchiveX className="h-4 w-4" />
                Desarchivar todas ({items.length})
              </Button>
            )}
          </BulkActions>
        )}
      </Header>

      <NotificationsList>
        {items.length === 0 ? (
          <EmptyState>
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400 mb-4 flex items-center justify-center">
                {tab === 'new' ? (
                  <Bell className="h-8 w-8" />
                ) : (
                  <ArchiveX className="h-8 w-8" />
                )}
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {tab === 'new' ? 'No hay notificaciones nuevas' : 'No hay notificaciones archivadas'}
              </h3>
              <p className="text-sm text-gray-500">
                {tab === 'new' 
                  ? 'Cuando recibas nuevas notificaciones aparecerán aquí.' 
                  : 'Las notificaciones archivadas aparecerán aquí.'
                }
              </p>
            </div>
          </EmptyState>
        ) : (
          <ScrollableList>
            {items.map((n) => (
              <NotificationItem key={n.notificationId} $unread={!n.isRead}>
                <NotificationContent>
                  <div className="flex items-center gap-3">
                    {!n.isRead && (
                      <UnreadIndicator />
                    )}
                    <div className={!n.isRead ? '' : 'ml-6'}>
                      <NotificationTitle $unread={!n.isRead}>
                        {n.title}
                      </NotificationTitle>
                      <NotificationBody>
                        {n.body}
                      </NotificationBody>
                      <NotificationTime>
                        {new Date(n.createdAt).toLocaleString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </NotificationTime>
                    </div>
                  </div>
                </NotificationContent>
                
                <NotificationActions>
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
                </NotificationActions>
              </NotificationItem>
            ))}
          </ScrollableList>
        )}
      </NotificationsList>
    </Wrapper>
  )
}

const Wrapper = tw.div`space-y-4 px-2 sm:px-4 pt-4 h-full flex flex-col`

const Header = tw.div`flex-shrink-0 space-y-4`

const Tabs = tw.div`flex gap-4 border-b`

const Tab = tw.button<{ $active?: boolean }>`pb-2 text-sm font-medium transition-colors cursor-pointer flex items-center gap-2
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}`

const Badge = tw.span`inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-full`

const BulkActions = tw.div`flex flex-wrap gap-2 justify-end`

const NotificationsList = tw.div`flex-1 min-h-0`

const EmptyState = tw.div`flex items-center justify-center h-full`

const ScrollableList = tw.div`space-y-2 h-full overflow-y-auto max-h-[calc(100vh-200px)] pr-2`

const NotificationItem = tw.li<{ $unread?: boolean }>`
  px-4 py-3 rounded-lg flex justify-between items-start gap-4 transition-all duration-200
  hover:shadow-sm border
  ${({ $unread }) => $unread ? 'bg-primary/5 border-primary/20' : 'bg-background border-border hover:bg-muted/50'}
`

const NotificationContent = tw.div`flex-1 min-w-0`

const UnreadIndicator = tw.div`w-3 h-3 bg-primary rounded-full flex-shrink-0 mt-1`

const NotificationTitle = tw.div<{ $unread?: boolean }>`
  font-medium text-sm leading-5 mb-1
  ${({ $unread }) => $unread ? 'text-foreground' : 'text-muted-foreground'}
`

const NotificationBody = tw.div`text-sm text-muted-foreground leading-5 mb-2`

const NotificationTime = tw.div`text-xs text-muted-foreground`

const NotificationActions = tw.div`flex gap-2 flex-shrink-0`

const ActionButton = tw.button<{ $variant: 'primary' | 'secondary' }>`
  text-xs px-3 py-1.5 rounded-md transition-all duration-200 cursor-pointer
  hover:shadow-sm border whitespace-nowrap
  ${({ $variant }) => 
    $variant === 'primary' 
      ? 'text-primary border-primary/20 hover:bg-primary/10' 
      : 'text-muted-foreground border-border hover:bg-muted hover:text-foreground'
  }
`
