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
import { identifyUser } from '@/utils/identifyUser'
import { toast } from 'sonner'

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
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Evitar hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null)
        setTenant(null)
        setLoading(false)
        
        // Solo ejecutar redirecciones del lado del cliente
        if (mounted && typeof window !== 'undefined') {
          // Redirigir al login cuando no hay usuario autenticado
          // Excluir ciertas rutas públicas para evitar loops infinitos
          const publicRoutes = ['/', '/login', '/signup', '/finishSignIn', '/contact', '/pricing']
          const currentPath = window.location.pathname
          
          if (!publicRoutes.includes(currentPath)) {
            router.push('/login')
          }
        }
        return
      }

      if (!firebaseUser.emailVerified) {
        try {
          await signOut(auth)
        } catch (signOutErr) {
          console.error('Error signing out unverified user:', signOutErr)
        }
        setUser(null)
        setTenant(null)
        setLoading(false)

        if (mounted && typeof window !== 'undefined') {
          const publicRoutes = ['/', '/login', '/signup', '/finishSignIn', '/contact', '/pricing']
          const currentPath = window.location.pathname

          if (!publicRoutes.includes(currentPath)) {
            router.push('/login')
          }
        }
        return
      }

      try {
        const userData = await waitForDoc<User>(doc(db, 'users', firebaseUser.uid))
        setUser(userData)

        const tenantData = await waitForDoc<Tenant>(doc(db, 'tenants', userData.tenantId))
        setTenant(tenantData)
        identifyUser(userData.uid, tenantData.tenantId)
      } catch (err) {
        console.error('Error cargando datos del usuario:', err)
        setUser(null)
        setTenant(null)
        
        // Solo ejecutar redirecciones del lado del cliente
        if (mounted && typeof window !== 'undefined') {
          // Si hay error cargando datos del usuario, también redirigir
          const publicRoutes = ['/', '/login', '/signup', '/finishSignIn', '/contact', '/pricing']
          const currentPath = window.location.pathname
          
          if (!publicRoutes.includes(currentPath)) {
            router.push('/login')
          }
        }
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [router, mounted])

  const pathname = usePathname()

  // Manejar redirecciones automáticas cuando el usuario está autenticado
  useEffect(() => {
    if (!mounted || loading) return
    
    // Si el usuario está autenticado y está en páginas públicas, redirigir al dashboard
    if (user && tenant) {
      const publicRoutes = ['/', '/login', '/signup', '/finishSignIn']
      if (publicRoutes.includes(pathname)) {
        router.push('/dashboard')
      }
    }
  }, [loading, user, tenant, pathname, router, mounted])

  const logout = async () => {
    await signOut(auth)
    setUser(null)
    setTenant(null)
    router.push('/')
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
