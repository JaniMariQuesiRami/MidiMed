import { db, storage } from '@/lib/firebase'
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore'
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage'
import {
  Patient,
  PatientInput,
  MedicalRecord,
  MedicalRecordInput,
} from '@/types/db'

export async function getPatients(tenantId?: string): Promise<Patient[]> {
  try {
    const base = collection(db, 'patients')
    const q = tenantId ? query(base, where('tenantId', '==', tenantId)) : base
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<Patient, 'patientId'>),
      patientId: d.id,
    }))
  } catch (err) {
    console.error('Error in getPatients:', err)
    return []
  }
}

export async function createPatient(
  data: PatientInput & { tenantId: string; createdBy: string },
): Promise<string> {
  try {
    const refDoc = doc(collection(db, 'patients'))
  const now = new Date().toISOString()
  await setDoc(refDoc, {
      ...data,
      patientId: refDoc.id,
      createdAt: now,
      updatedAt: now,
  })
    return refDoc.id
  } catch (err) {
    console.error('Error in createPatient:', err)
    throw err
  }
}

export async function getPatientById(id: string): Promise<Patient> {
  try {
    const snap = await getDoc(doc(db, 'patients', id))
    if (!snap.exists()) throw new Error('Patient not found')
    return snap.data() as Patient
  } catch (err) {
    console.error('Error in getPatientById:', err)
    throw err
  }
}

export async function updatePatient(id: string, data: PatientInput): Promise<void> {
  try {
    await updateDoc(doc(db, 'patients', id), {
      ...data,
      updatedAt: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Error in updatePatient:', err)
    throw err
  }
}

export async function deletePatient(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'patients', id))
  } catch (err) {
    console.error('Error in deletePatient:', err)
    throw err
  }
}

export async function getMedicalRecords(
  patientId: string,
  tenantId?: string,
): Promise<MedicalRecord[]> {
  try {
    const conditions = [where('patientId', '==', patientId)]
    if (tenantId) conditions.push(where('tenantId', '==', tenantId))
    const q = query(collection(db, 'medicalRecords'), ...conditions)
    const snap = await getDocs(q)
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<MedicalRecord, 'recordId'>),
      recordId: d.id,
    }))
  } catch (err) {
    console.error('Error in getMedicalRecords:', err)
    return []
  }
}

export async function createMedicalRecord(
  patientId: string,
  data: MedicalRecordInput & { tenantId: string; createdBy: string },
): Promise<string> {
  try {
    const refDoc = doc(collection(db, 'medicalRecords'))
    const now = new Date().toISOString()
    await setDoc(refDoc, {
      ...data,
      patientId,
      recordId: refDoc.id,
      createdAt: now,
    })
    return refDoc.id
  } catch (err) {
    console.error('Error in createMedicalRecord:', err)
    throw err
  }
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  try {
    const snap = await getDoc(doc(db, 'medicalRecords', id))
    if (!snap.exists()) throw new Error('Medical record not found')
    return snap.data() as MedicalRecord
  } catch (err) {
    console.error('Error in getMedicalRecordById:', err)
    throw err
  }
}

export async function updateMedicalRecord(id: string, data: MedicalRecordInput): Promise<void> {
  try {
    await updateDoc(doc(db, 'medicalRecords', id), data)
  } catch (err) {
    console.error('Error in updateMedicalRecord:', err)
    throw err
  }
}

export async function deleteMedicalRecord(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'medicalRecords', id))
  } catch (err) {
    console.error('Error in deleteMedicalRecord:', err)
    throw err
  }
}

export async function uploadRecordAttachment(recordId: string, file: File): Promise<string> {
  try {
    const storageRef = ref(storage, `medicalRecords/${recordId}/${file.name}`)
    await uploadBytes(storageRef, file)
    return await getDownloadURL(storageRef)
  } catch (err) {
    console.error('Error in uploadRecordAttachment:', err)
    throw err
  }
}

export async function getAllMedicalRecords(tenantId: string): Promise<MedicalRecord[]> {
  try {
    const q = query(collection(db, 'medicalRecords'), where('tenantId', '==', tenantId))
    const snap = await getDocs(q)
    
    return snap.docs.map((d) => ({
      ...(d.data() as Omit<MedicalRecord, 'recordId'>),
      recordId: d.id,
    }))
  } catch (err) {
    console.error('Error in getAllMedicalRecords:', err)
    return []
  }
}
