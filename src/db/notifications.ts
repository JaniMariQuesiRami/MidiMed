import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { Notification } from '@/types/db'

export async function getNotifications(userId: string): Promise<Notification[]> {
  const q = query(collection(db, 'notifications'), where('userId', '==', userId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Notification, 'notificationId'>), notificationId: d.id })) as Notification[]
}

export async function markNotificationAsRead(id: string): Promise<void> {
  await updateDoc(doc(db, 'notifications', id), { isRead: true })
}
