import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function createLead(leadData: {
  name: string
  email: string
  message?: string
}): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...leadData,
      createdAt: serverTimestamp(),
      status: 'new',
      source: 'contact-form'
    })
    return docRef.id
  } catch (error) {
    console.error('Error creating lead:', error)
    throw error
  }
}
