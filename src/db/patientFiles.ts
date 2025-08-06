// src/services/patientFiles.ts
// ---------------------------------------------
// Módulo para manejar archivos de pacientes con Firebase
// Usa únicamente el SDK de Firebase Storage (sin REST manual).
// Evita CORS al descargar usando getDownloadURL (URL firmada sin Authorization).
// ---------------------------------------------

import { db, storage } from '@/lib/firebase'
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
} from 'firebase/firestore'
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  getMetadata,
} from 'firebase/storage'
import type { PatientFile } from '@/types/db'

/**
 * Obtiene los archivos de un paciente (opcionalmente filtrando por tenant).
 */
export async function getPatientFiles(
  patientId: string,
  tenantId?: string,
): Promise<PatientFile[]> {
  try {
    const condiciones = [where('patientId', '==', patientId)]
    if (tenantId) condiciones.push(where('tenantId', '==', tenantId))

    const q = query(collection(db, 'patientFiles'), ...condiciones)
    const snap = await getDocs(q)

    return snap.docs.map((d) => ({
      ...(d.data() as Omit<PatientFile, 'fileId'>),
      fileId: d.id,
    }))
  } catch (err) {
    console.error('Error en getPatientFiles:', err)
    return []
  }
}

/**
 * Sube un archivo al Storage y guarda el registro en Firestore.
 * - Usa uploadBytes (multipart) + metadata contentType
 * - Obtiene URL firmada con getDownloadURL (no requiere Authorization al descargar)
 */
export async function uploadPatientFile(
  patientId: string,
  tenantId: string,
  userId: string,
  file: File,
): Promise<PatientFile> {
  try {
    // ID del documento de Firestore
    const fileId = doc(collection(db, 'patientFiles')).id

    // Ruta de almacenamiento en Storage
    const storagePath = `tenants/${tenantId}/patients/${patientId}/files/${fileId}-${file.name}`
    const storageRef = ref(storage, storagePath)

    // Subir el archivo con su contentType (ayuda a que Storage sirva el tipo correcto)
    await uploadBytes(storageRef, file, {
      contentType: file.type || 'application/octet-stream',
    })

    // URL firmada para descarga directa (sin Authorization)
    const url = await getDownloadURL(storageRef)

    const now = new Date().toISOString()

    const data: PatientFile = {
      tenantId,
      fileId,
      patientId,
      name: file.name,
      url, // guarda la URL firmada
      storagePath,
      uploadedAt: now,
      uploadedBy: userId,
      // si tu tipo lo permite, puedes guardar:
      // contentType: meta.contentType,
      // size: Number(meta.size || file.size),
    }

    await setDoc(doc(db, 'patientFiles', fileId), data)
    return data
  } catch (err) {
    console.error('Error en uploadPatientFile:', err)
    throw err
  }
}

/**
 * Borra un archivo (Firestore + Storage).
 */
export async function deletePatientFile(
  fileId: string,
  storagePath: string,
): Promise<void> {
  try {
    await deleteDoc(doc(db, 'patientFiles', fileId))
    await deleteObject(ref(storage, storagePath))
  } catch (err) {
    console.error('Error en deletePatientFile:', err)
    throw err
  }
}

/**
 * Helper: devuelve SIEMPRE una URL firmada fresca para un storagePath.
 * Útil si la URL guardada expiró o si prefieres no persistirla.
 */
export async function getFreshDownloadUrl(storagePath: string): Promise<string> {
  const storageRef = ref(storage, storagePath)
  return getDownloadURL(storageRef)
}

/**
 * Helper: descarga el contenido del archivo como texto usando fetch SIN headers.
 * Importantísimo: NO agregues Authorization ni Content-Type aquí.
 */
export async function fetchPatientFileAsText(url: string): Promise<string> {
  const res = await fetch(url, {
    // Evita cualquier wrapper que meta Authorization.
    // cache: 'no-store' // opcional si quieres saltarte caché
  })
  if (!res.ok) {
    throw new Error(`Descarga falló con status ${res.status}`)
  }
  return res.text()
}

/**
 * Helper: si usas Axios global con Authorization, ignora ese header para Storage.
 * Llama esto una sola vez al iniciar la app (por ejemplo en _app.tsx).
 *
 * import axios from 'axios'
 * setupAxiosToSkipAuthForStorage(axios)
 */
export function setupAxiosToSkipAuthForStorage(axiosInstance: unknown) {
  if (typeof axiosInstance !== 'object' || axiosInstance === null) {
    throw new Error('Invalid axios instance provided')
  }

  ;(axiosInstance as { interceptors: { request: { use: (interceptor: (config: unknown) => unknown) => void } } }).interceptors.request.use((config: unknown) => {
    if (typeof config !== 'object' || config === null) {
      return config
    }

    const url = ((config as { url?: string }).url || '') as string
    if (
      url.includes('firebasestorage.googleapis.com') ||
      url.includes('.firebasestorage.app')
    ) {
      const headers = (config as { headers?: Record<string, unknown> }).headers
      if (headers && 'Authorization' in headers) {
        delete headers.Authorization
      }
      if (headers && 'Content-Type' in headers && !(config as { data?: unknown }).data) {
        delete headers['Content-Type']
      }
    }
    return config
  })
}

/**
 * (Opcional) Si en algún flujo necesitas metadata del archivo:
 */
export async function getPatientFileMetadata(
  storagePath: string,
): Promise<{
  contentType?: string
  size?: number
  updated?: string
}> {
  const storageRef = ref(storage, storagePath)
  const meta = await getMetadata(storageRef)
  return {
    contentType: meta.contentType || undefined,
    size: meta.size ? Number(meta.size) : undefined,
    updated: meta.updated,
  }
}
