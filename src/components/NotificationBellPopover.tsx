'use client'
import { useContext, useEffect, useState } from 'react'
import { Bell, X } from 'lucide-react'
import { listenToNotifications, markNotificationAsRead } from '@/db/notifications'
import { UserContext } from '@/contexts/UserContext'
import { toast } from 'sonner'
import tw from 'tailwind-styled-components'
import { Notification } from '@/types/db'
import LoadingSpinner from './LoadingSpinner'

export default function NotificationBellPopover() {
  const { user, tenant } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [notifications, setNotifications] = useState([] as Notification[])

  useEffect(() => {
    if (!user || !tenant) return
    
    console.log('🔔 Setting up notification bell listener')
    setLoading(true)
    
    const unsub = listenToNotifications(
      user.uid,
      tenant.tenantId,
      { archived: false, limit: 5 },
      (notificationList) => {
        console.log('🔔 Bell received notifications:', notificationList)
        // Filter only unread notifications for the bell
        const unreadNotifications = notificationList.filter((n) => !n.isRead)
        setNotifications(unreadNotifications)
        setLoading(false)
      }
    )
    
    return () => unsub()
  }, [user, tenant])

  const markRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      setNotifications((prev) => prev.filter((n) => n.notificationId !== id))
    } catch {
      toast.error('No se pudo marcar como leída')
    }
  }

  if (!user || !tenant) return null

  const unreadCount = notifications.length

  return (
    <>
      <BellButton onClick={() => setOpen(true)}>
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>
        )}
      </BellButton>

      {/* Desktop Popover */}
      <DesktopWrapper 
        onMouseEnter={() => setOpen(true)} 
        onMouseLeave={() => setOpen(false)}
        className="hidden md:block"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge>{unreadCount > 9 ? '9+' : unreadCount}</Badge>
        )}
        {open && (
          <Popover>
            {loading ? (
              <div className="p-2 flex justify-center">
                <LoadingSpinner className="h-4 w-4" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-2 text-sm">Sin notificaciones</div>
            ) : (
              notifications.map((n) => (
                <Item key={n.notificationId}>
                  <span>{n.title}</span>
                  <button className="text-xs text-primary cursor-pointer" onClick={() => markRead(n.notificationId)}>
                    Marcar leída
                  </button>
                </Item>
              ))
            )}
          </Popover>
        )}
      </DesktopWrapper>

      {/* Mobile Modal */}
      {open && (
        <MobileModal onClick={() => setOpen(false)}>
          <ModalContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalHeader>
              <h3 className="text-lg font-semibold">Notificaciones</h3>
              <button onClick={() => setOpen(false)} className="cursor-pointer">
                <X size={20} />
              </button>
            </ModalHeader>
            <ModalBody>
              {loading ? (
                <div className="p-4 flex justify-center">
                  <LoadingSpinner className="h-4 w-4" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  Sin notificaciones nuevas
                </div>
              ) : (
                notifications.map((n) => (
                  <NotificationItem key={n.notificationId} className={`${!n.isRead ? 'bg-primary/10' : 'bg-muted/10'}`}>
                    <div className="flex items-center gap-3 flex-1">
                      {!n.isRead && (
                        <div className="w-3 h-3 bg-primary rounded-full flex-shrink-0"></div>
                      )}
                      <div className={!n.isRead ? '' : 'ml-6'}>
                        <p className="font-medium">{n.title}</p>
                        {n.body && (
                          <p className="text-sm text-muted-foreground">{n.body}</p>
                        )}
                      </div>
                    </div>
                    <button 
                      className="text-sm text-primary font-medium cursor-pointer" 
                      onClick={() => markRead(n.notificationId)}
                    >
                      Marcar leída
                    </button>
                  </NotificationItem>
                ))
              )}
            </ModalBody>
          </ModalContent>
        </MobileModal>
      )}
    </>
  )
}

const DesktopWrapper = tw.div`relative p-1 rounded hover:bg-muted transition cursor-pointer`
const Popover = tw.div`absolute right-0 mt-2 w-64 rounded-md border bg-background shadow-lg z-50`
const Item = tw.div`flex justify-between items-center px-3 py-2 text-sm border-b last:border-0`

const BellButton = tw.button`
  relative p-1 rounded hover:bg-muted transition md:hidden cursor-pointer
`

const Badge = tw.span`
  absolute -top-1 -right-1 h-5 w-5 text-xs font-medium text-white 
  bg-red-500 rounded-full flex items-center justify-center
`

const MobileModal = tw.div`
  fixed inset-0 bg-black/50 z-50 flex items-end md:hidden
`

const ModalContent = tw.div`
  bg-background rounded-t-2xl w-full h-[80vh] flex flex-col
`

const ModalHeader = tw.div`
  flex items-center justify-between p-4 border-b
`

const ModalBody = tw.div`
  flex-1 overflow-y-auto
`

const NotificationItem = tw.div`
  flex items-start gap-3 px-4 py-3 border-b last:border-0 rounded-lg mx-2 mb-2 last:mb-0
`

