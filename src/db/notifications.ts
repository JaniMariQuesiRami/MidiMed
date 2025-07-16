import { db } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  onSnapshot,
  orderBy,
  limit,
  QueryDocumentSnapshot,
  startAfter,
} from 'firebase/firestore'
import { Notification } from '@/types/db'

export async function getNotifications(userId: string): Promise<Notification[]> {
  try {
    console.log('🔔 Getting notifications for userId:', userId)
    
    const q = query(collection(db, 'notifications'), where('userId', '==', userId))
    const snap = await getDocs(q)
    
    console.log('🔔 Basic notifications query result:', {
      docCount: snap.docs.length,
      isEmpty: snap.empty
    })
    
    const notifications = snap.docs.map((d) => {
      const data = d.data()
      console.log('🔔 Processing basic notification doc:', {
        id: d.id,
        data: data
      })
      return {
        ...(data as Omit<Notification, 'notificationId'>),
        notificationId: d.id,
      }
    }) as Notification[]
    
    console.log('🔔 Final basic notifications list:', notifications)
    return notifications
  } catch (err) {
    console.error('Error in getNotifications:', err)
    return []
  }
}

export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: true })
  } catch (err) {
    console.error('Error in markNotificationAsRead:', err)
    throw err
  }
}

export async function markNotificationAsUnread(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { isRead: false })
  } catch (err) {
    console.error('Error in markNotificationAsUnread:', err)
    throw err
  }
}

export async function archiveNotification(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { archived: true })
  } catch (err) {
    console.error('Error in archiveNotification:', err)
    throw err
  }
}

export async function unarchiveNotification(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { archived: false })
  } catch (err) {
    console.error('Error in unarchiveNotification:', err)
    throw err
  }
}

export function listenToNotifications(
  userId: string,
  tenantId: string,
  options: { archived?: boolean; limit?: number } = {},
  onChange?: (
    items: Notification[],
    lastDoc: QueryDocumentSnapshot | null,
  ) => void,
) {
  try {

    // Query without archived filter - we'll filter in code to handle missing field
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      limit(options.limit ?? 20), // Increased limit to account for filtering
    )
    // Firestore composite index required for: userId + tenantId + createdAt
    return onSnapshot(q, (snap) => {
      const allNotifications = snap.docs.map((d) => {
        const data = d.data()
        console.log('🔔 Processing notification doc:', {
          id: d.id,
          data: data,
          archived: data.archived,
          archivedType: typeof data.archived
        })
        return {
          ...(data as Omit<Notification, 'notificationId'>),
          notificationId: d.id,
        }
      }) as Notification[]
      
      // Filter by archived status in code
      const targetArchived = options.archived ?? false
      const filteredNotifications = allNotifications.filter(notification => {
        const isArchived = notification.archived === true
        const shouldShow = targetArchived ? isArchived : !isArchived
        console.log('🔔 Filtering notification:', {
          id: notification.notificationId,
          archived: notification.archived,
          isArchived,
          targetArchived,
          shouldShow
        })
        return shouldShow
      })
      
      // Limit the results after filtering
      const limitedNotifications = filteredNotifications.slice(0, options.limit ?? 10)

      
      onChange?.(limitedNotifications, snap.docs[snap.docs.length - 1] ?? null)
    })
  } catch (err) {
    console.error('Error in listenToNotifications:', err)
    return () => {}
  }
}

export async function getMoreNotifications(
  userId: string,
  tenantId: string,
  options: {
    archived?: boolean
    limit?: number
    startAfterDoc: QueryDocumentSnapshot
  },
): Promise<{ items: Notification[]; lastDoc: QueryDocumentSnapshot | null }> {
  try {
    console.log('🔔 Getting more notifications with params:', {
      userId,
      tenantId,
      archived: options.archived ?? false,
      limit: options.limit ?? 10,
      startAfterDoc: options.startAfterDoc.id
    })
    
    // Query without archived filter - we'll filter in code to handle missing field
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('tenantId', '==', tenantId),
      orderBy('createdAt', 'desc'),
      startAfter(options.startAfterDoc),
      limit(options.limit ?? 20), // Increased limit to account for filtering
    )
    // Firestore composite index required for: userId + tenantId + createdAt
    const snap = await getDocs(q)
    
    console.log('🔔 More notifications query result:', {
      docCount: snap.docs.length,
      isEmpty: snap.empty
    })
    
    const allNotifications = snap.docs.map((d) => {
      const data = d.data()
      console.log('🔔 Processing more notification doc:', {
        id: d.id,
        data: data,
        archived: data.archived,
        archivedType: typeof data.archived
      })
      return {
        ...(data as Omit<Notification, 'notificationId'>),
        notificationId: d.id,
      }
    }) as Notification[]
    
    // Filter by archived status in code
    const targetArchived = options.archived ?? false
    const filteredNotifications = allNotifications.filter(notification => {
      const isArchived = notification.archived === true
      const shouldShow = targetArchived ? isArchived : !isArchived
      console.log('🔔 Filtering more notification:', {
        id: notification.notificationId,
        archived: notification.archived,
        isArchived,
        targetArchived,
        shouldShow
      })
      return shouldShow
    })
    
    // Limit the results after filtering
    const limitedNotifications = filteredNotifications.slice(0, options.limit ?? 10)
    
    console.log('🔔 More notifications final result:', {
      total: allNotifications.length,
      afterFilter: filteredNotifications.length,
      afterLimit: limitedNotifications.length,
      notifications: limitedNotifications
    })
    
    return {
      items: limitedNotifications,
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    }
  } catch (err) {
    console.error('Error in getMoreNotifications:', err)
    return { items: [], lastDoc: null }
  }
}
