import { db } from '@/lib/firebase'
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  Timestamp,
  limit,
} from 'firebase/firestore'
import type { UtmCampaign } from '@/types/db'

const TTL_MS = 30 * 60 * 1000 // 30 minutes

export async function saveUtmCampaign(
  data: Omit<UtmCampaign, 'createdAt'>,
): Promise<string | null> {
  try {
    const col = collection(db, 'UtmCampaigns')
    const thirtyMinutesAgo = Timestamp.fromDate(new Date(Date.now() - TTL_MS))

    const q = query(
      col,
      where('fullUrl', '==', data.fullUrl),
      where('createdAt', '>=', thirtyMinutesAgo),
      limit(1),
    )
    // Firestore composite index required for: fullUrl + createdAt
    const snap = await getDocs(q)
    if (!snap.empty) {
      return snap.docs[0].id
    }

    const docRef = await addDoc(col, {
      ...data,
      createdAt: serverTimestamp(),
    })
    return docRef.id
  } catch (err) {
    console.error('Error saving UTM campaign:', err)
    return null
  }
}

export async function saveUtmCampaignFromUrl(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  try {
    const params = new URLSearchParams(window.location.search)
    const utm: Omit<UtmCampaign, 'createdAt'> = {
      fullUrl: window.location.href,
    }

    const fields: (keyof UtmCampaign)[] = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ]

    fields.forEach((field) => {
      const value = params.get(field)
      if (value) {
        // @ts-expect-error dynamic assignment of optional fields
        utm[field] = value
      }
    })

    utm.userAgent = navigator?.userAgent
    const referer = document?.referrer
    if (referer) {
      utm.referer = referer
    }

    // If only fullUrl is present, no UTM params were provided
    if (Object.keys(utm).length === 1) return null

    const cached = localStorage.getItem('utmCampaign')
    if (cached) {
      try {
        const parsed = JSON.parse(cached) as {
          id: string
          fullUrl: string
          timestamp: number
        }
        if (
          parsed.fullUrl === utm.fullUrl &&
          Date.now() - parsed.timestamp < TTL_MS
        ) {
          return parsed.id
        }
      } catch {
        // ignore parse errors
      }
    }

    const id = await saveUtmCampaign(utm)
    if (id) {
      localStorage.setItem(
        'utmCampaign',
        JSON.stringify({ id, fullUrl: utm.fullUrl, timestamp: Date.now() }),
      )
    }
    return id
  } catch (err) {
    console.error('Error processing UTM campaign from URL:', err)
    return null
  }
}

