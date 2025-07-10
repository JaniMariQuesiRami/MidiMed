"use client"

import { useCallback, useContext, useEffect, useRef, useState } from "react"
import { Bell } from "lucide-react"
import {
  archiveNotification,
  listenToNotifications,
  getMoreNotifications,
  markNotificationAsRead,
} from "@/db/notifications"
import { UserContext } from "@/contexts/UserContext"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import tw from "tailwind-styled-components"
import type { Notification } from "@/types/db"
import type { QueryDocumentSnapshot } from "firebase/firestore"
import LoadingSpinner from "./LoadingSpinner"
import { toast } from "sonner"

export default function SidebarNotificationsPanel({
  collapsed,
}: {
  collapsed: boolean
}) {
  const { user, tenant } = useContext(UserContext)
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<"all" | "archived">("all")
  const [unreadCount, setUnreadCount] = useState(0)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot | null>(null)
  const [loadingMore, setLoadingMore] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!user || !tenant) return
    const unsub = listenToNotifications(
      user.uid,
      tenant.tenantId,
      { archived: tab === "archived" },
      (items, last) => {
        setNotifications(items)
        setLastDoc(last)
        setUnreadCount(items.filter((n) => !n.isRead).length)
      },
    )
    return () => unsub()
  }, [user, tenant, tab])

  const loadMore = useCallback(async () => {
    if (!user || !tenant || !lastDoc) return
    setLoadingMore(true)
    try {
      const { items, lastDoc: newLast } = await getMoreNotifications(
        user.uid,
        tenant.tenantId,
        { archived: tab === "archived", startAfterDoc: lastDoc },
      )
      setNotifications((prev) => {
        const ids = new Set(prev.map((n) => n.notificationId))
        return [...prev, ...items.filter((n) => !ids.has(n.notificationId))]
      })
      setLastDoc(newLast)
    } catch (err) {
      console.error("Error loading more notifications:", err)
      toast.error("Error al cargar notificaciones")
    } finally {
      setLoadingMore(false)
    }
  }, [user, tenant, lastDoc, tab])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 10) loadMore()
    }
    el.addEventListener("scroll", onScroll)
    return () => el.removeEventListener("scroll", onScroll)
  }, [loadMore])

  const markRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
    } catch {
      toast.error("No se pudo marcar como leída")
    }
  }

  const archive = async (id: string) => {
    try {
      await archiveNotification(id)
    } catch {
      toast.error("No se pudo archivar")
    }
  }

  if (!user || !tenant) return null

  return (
    <>
      <BellButton onClick={() => setOpen(true)} $collapsed={collapsed}>
        <Bell size={20} />
        {!collapsed && <span>Notificaciones</span>}
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </BellButton>
      <Dialog open={open} onOpenChange={(v) => !v && setOpen(false)}>
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
          />
          <DialogContent
            showCloseButton={false}
            className="fixed right-0 top-0 h-full max-w-xs w-full rounded-none p-0 z-50 shadow-2xl bg-white dark:bg-background border-l border-border"
            style={{ boxShadow: "rgba(0,0,0,0.15) -4px 0px 24px" }}
          >
            <PanelWrapper>
              <Header>
                <DialogHeader>
                  <DialogTitle>Notificaciones</DialogTitle>
                </DialogHeader>
                <Tabs>
                  <Tab $active={tab === "all"} onClick={() => setTab("all")}>
                    Todo
                  </Tab>
                  <Tab
                    $active={tab === "archived"}
                    onClick={() => setTab("archived")}
                  >
                    Archivado
                  </Tab>
                </Tabs>
              </Header>
              <List ref={listRef}>
                {notifications.length === 0 ? (
                  <EmptyState>No hay notificaciones</EmptyState>
                ) : (
                  notifications.map((n) => (
                    <Item key={n.notificationId} $unread={!n.isRead}>
                      <div>
                        <p className="font-medium">{n.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {n.body}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {!n.isRead && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => markRead(n.notificationId)}
                          >
                            Leer
                          </Button>
                        )}
                        {tab !== "archived" && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => archive(n.notificationId)}
                          >
                            Archivar
                          </Button>
                        )}
                      </div>
                    </Item>
                  ))
                )}
                {loadingMore && (
                  <div className="py-4 flex justify-center">
                    <LoadingSpinner className="h-4 w-4" />
                  </div>
                )}
              </List>
            </PanelWrapper>
          </DialogContent>
        </div>
      </Dialog>
    </>
  )
}

const BellButton = tw.button<{ $collapsed: boolean }>`
  w-full flex items-center gap-2 relative text-muted-foreground hover:bg-muted rounded-lg transition-colors
  ${({ $collapsed }) => ($collapsed ? 'justify-center p-3' : 'px-4 py-3')}
`

const Badge = tw.span`
  bg-destructive text-white text-xs rounded-full px-1 min-w-4 h-4 flex items-center justify-center absolute top-1 right-1
`

const PanelWrapper = tw.div`flex flex-col h-full`
const Header = tw.div`p-4 border-b space-y-2`
const Tabs = tw.div`flex gap-4 border-b pb-2`
const Tab = tw.button<{ $active?: boolean }>`text-sm font-medium transition-colors pb-1
  ${({ $active }) => ($active ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground')}`

const List = tw.div`flex-1 overflow-y-auto`
const Item = tw.div<{ $unread?: boolean }>`flex justify-between items-start gap-2 p-3 border-b text-sm
  ${({ $unread }) => $unread && 'bg-primary/5'}
`
const EmptyState = tw.div`p-4 text-center text-sm text-muted-foreground`

