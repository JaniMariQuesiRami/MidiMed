import { db, storage } from '@/lib/firebase'
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import type { PatientFile } from '@/types/db'

export async function getPatientFiles(patientId: string, tenantId?: string): Promise<PatientFile[]> {
  try {
    const conditions = [where('patientId', '==', patientId)]
    if (tenantId) conditions.push(where('tenantId', '==', tenantId))
    const q = query(collection(db, 'patientFiles'), ...conditions)
    // If this query requires a composite index, create it in the Firestore console.
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<PatientFile, 'fileId'>),
      fileId: d.id,
    }))
  } catch (err) {
    console.error('Error in getPatientFiles:', err)
    return []
  }
}

export async function uploadPatientFile(
  patientId: string,
  tenantId: string,
  userId: string,
  file: File,
): Promise<PatientFile> {
  try {
    const fileId = doc(collection(db, 'patientFiles')).id
    const storagePath = `patients/${patientId}/files/${fileId}-${file.name}`
    const storageRef = ref(storage, storagePath)
    await uploadBytes(storageRef, file)
    const url = await getDownloadURL(storageRef)
    const now = new Date().toISOString()
    const data: PatientFile = {
      tenantId,
      fileId,
      patientId,
      name: file.name,
      url,
      storagePath,
      uploadedAt: now,
      uploadedBy: userId,
    }
    await setDoc(doc(db, 'patientFiles', fileId), data)
    return data
  } catch (err) {
    console.error('Error in uploadPatientFile:', err)
    throw err
  }
}

export async function deletePatientFile(fileId: string, storagePath: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'patientFiles', fileId))
    await deleteObject(ref(storage, storagePath))
  } catch (err) {
    console.error('Error in deletePatientFile:', err)
    throw err
  }
}
