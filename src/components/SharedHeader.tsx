'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import BrandLogo from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'

type SharedHeaderProps = {
  showAuthButtons?: boolean
  currentPage?: 'landing' | 'login' | 'signup'
}

export default function SharedHeader({ showAuthButtons = true, currentPage = 'landing' }: SharedHeaderProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

  return (
    <Header>
      {/* Logo - clickable to go to landing */}
      <LogoWrapper onClick={() => router.push('/')}>
        <BrandLogo />
      </LogoWrapper>

      {/* Navigation Links */}
      <NavLinks>
        <NavButton onClick={() => router.push('/precios')}>
          Precios
        </NavButton>
        <NavButton onClick={() => router.push('/contactanos')}>
          Contáctanos
        </NavButton>
      </NavLinks>

      {/* Auth Buttons */}
      {showAuthButtons && (
        <AuthButtons>
          <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </ThemeToggle>
          {currentPage !== 'signup' && (
            <Button
              asChild
              variant="secondary"
              className="bg-primary text-white hover:bg-primary/50 relative overflow-hidden shine-btn"
            >
              <Link href="/signup">Crear cuenta</Link>
            </Button>
          )}
          {currentPage !== 'login' && (
            <Button asChild variant="outline">
              <Link href="/login">Log In</Link>
            </Button>
          )}
        </AuthButtons>
      )}
    </Header>
  )
}

// Styled components
const Header = tw.header`
  flex items-center justify-between px-6 py-4 mb-16 relative z-10
  bg-transparent
`

const LogoWrapper = tw.div`
  cursor-pointer
`

const NavLinks = tw.nav`
  hidden sm:flex items-center gap-4 ml-8
`

const NavButton = tw.button`
  text-sm font-medium text-white/80 hover:text-white transition-colors cursor-pointer
  px-3 py-2 rounded-md hover:bg-black/5 dark:hover:bg-white/5 font-[600]
`

const AuthButtons = tw.nav`
  flex gap-2 ml-auto items-center
`

const ThemeToggle = tw.button`
  p-1 rounded hover:bg-white/10 cursor-pointer transition-colors text-white/80 hover:text-white
`
