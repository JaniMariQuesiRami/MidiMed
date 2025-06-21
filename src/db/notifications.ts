import { db } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore'
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
