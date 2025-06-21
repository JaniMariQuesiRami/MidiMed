'use client'

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import {
  doc,
  getDoc,
} from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'
import { User, Tenant } from '@/types/db'
import { useRouter, usePathname } from 'next/navigation'

type UserContextType = {
  user: User | null
  tenant: Tenant | null
  loading: boolean
  logout: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  tenant: null,
  loading: true,
  logout: async () => {},
})

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tenant, setTenant] = useState<Tenant | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setTenant(null)
        setLoading(false)
        return
      }

      try {
        const userData = await waitForDoc<User>(doc(db, 'users', firebaseUser.uid))
        setUser(userData)

        const tenantData = await waitForDoc<Tenant>(doc(db, 'tenants', userData.tenantId))
        setTenant(tenantData)
      } catch (err) {
        console.error('Error cargando datos del usuario:', err)
        setUser(null)
        setTenant(null)
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [])

  const pathname = usePathname()

  useEffect(() => {
    if (loading) return
    if (!user || !tenant) return
    if (pathname === '/' || pathname === '/login' || pathname === '/signup') {
      router.push('/dashboard')
    }
  }, [loading, user, tenant, pathname, router])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setTenant(null)
    router.push('/login')
  }

  return (
    <UserContext.Provider value={{ user, tenant, loading, logout }}>
      {children}
    </UserContext.Provider>
  )
}

async function waitForDoc<T>(ref: ReturnType<typeof doc>, retries = 5, delayMs = 300): Promise<T> {
  for (let i = 0; i < retries; i++) {
    const snap = await getDoc(ref)
    if (snap.exists()) return snap.data() as T
    await new Promise((res) => setTimeout(res, delayMs))
  }
  throw new Error('Documento no encontrado después de varios intentos')
}

export function useUser() {
  return useContext(UserContext)
}

export { UserContext }
