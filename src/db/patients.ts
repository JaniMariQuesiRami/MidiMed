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
  const base = collection(db, 'patients')
  const q = tenantId ? query(base, where('tenantId', '==', tenantId)) : base
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Patient, 'patientId'>), patientId: d.id }))
}

export async function createPatient(
  data: PatientInput & { tenantId: string; createdBy: string },
): Promise<string> {
  const refDoc = doc(collection(db, 'patients'))
  const now = new Date().toISOString()
  await setDoc(refDoc, {
    ...data,
    patientId: refDoc.id,
    createdAt: now,
  })
  return refDoc.id
}

export async function getPatientById(id: string): Promise<Patient> {
  const snap = await getDoc(doc(db, 'patients', id))
  if (!snap.exists()) throw new Error('Patient not found')
  return snap.data() as Patient
}

export async function updatePatient(id: string, data: PatientInput): Promise<void> {
  await updateDoc(doc(db, 'patients', id), data)
}

export async function deletePatient(id: string): Promise<void> {
  await deleteDoc(doc(db, 'patients', id))
}

export async function getMedicalRecords(
  patientId: string,
  tenantId?: string,
): Promise<MedicalRecord[]> {
  const conditions = [where('patientId', '==', patientId)]
  if (tenantId) conditions.push(where('tenantId', '==', tenantId))
  const q = query(collection(db, 'medicalRecords'), ...conditions)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ ...(d.data() as Omit<MedicalRecord, 'recordId'>), recordId: d.id }))
}

export async function createMedicalRecord(
  patientId: string,
  data: MedicalRecordInput & { tenantId: string; createdBy: string },
): Promise<string> {
  const refDoc = doc(collection(db, 'medicalRecords'))
  const now = new Date().toISOString()
  await setDoc(refDoc, {
    ...data,
    patientId,
    recordId: refDoc.id,
    createdAt: now,
  })
  return refDoc.id
}

export async function getMedicalRecordById(id: string): Promise<MedicalRecord> {
  const snap = await getDoc(doc(db, 'medicalRecords', id))
  if (!snap.exists()) throw new Error('Medical record not found')
  return snap.data() as MedicalRecord
}

export async function updateMedicalRecord(id: string, data: MedicalRecordInput): Promise<void> {
  await updateDoc(doc(db, 'medicalRecords', id), data)
}

export async function uploadRecordAttachment(recordId: string, file: File): Promise<string> {
  const storageRef = ref(storage, `medicalRecords/${recordId}/${file.name}`)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}
