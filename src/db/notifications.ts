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
    const q = query(collection(db, 'notifications'), where('userId', '==', userId))
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<Notification, 'notificationId'>),
      notificationId: d.id,
    })) as Notification[]
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

export async function archiveNotification(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { archived: true })
  } catch (err) {
    console.error('Error in archiveNotification:', err)
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
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('tenantId', '==', tenantId),
      where('archived', '==', options.archived ?? false),
      orderBy('createdAt', 'desc'),
      limit(options.limit ?? 10),
    )
    // Firestore composite index required for: userId + tenantId + archived + createdAt
    return onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({
        ...(d.data() as Omit<Notification, 'notificationId'>),
        notificationId: d.id,
      })) as Notification[]
      onChange?.(list, snap.docs[snap.docs.length - 1] ?? null)
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
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('tenantId', '==', tenantId),
      where('archived', '==', options.archived ?? false),
      orderBy('createdAt', 'desc'),
      startAfter(options.startAfterDoc),
      limit(options.limit ?? 10),
    )
    // Firestore composite index required for: userId + tenantId + archived + createdAt
    const snap = await getDocs(q)
    return {
      items: snap.docs.map((d) => ({
        ...(d.data() as Omit<Notification, 'notificationId'>),
        notificationId: d.id,
      })) as Notification[],
      lastDoc: snap.docs[snap.docs.length - 1] ?? null,
    }
  } catch (err) {
    console.error('Error in getMoreNotifications:', err)
    return { items: [], lastDoc: null }
  }
}
