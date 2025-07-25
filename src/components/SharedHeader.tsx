'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import BrandLogo from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'
import { useState } from 'react'

type SharedHeaderProps = {
  showAuthButtons?: boolean
  currentPage?: 'landing' | 'login' | 'signup'
}

export default function SharedHeader({ showAuthButtons = true, currentPage = 'landing' }: SharedHeaderProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <>
      <Header>
        {/* Logo - clickable to go to landing */}
        <LogoWrapper onClick={() => router.push('/')}>
          <BrandLogo />
        </LogoWrapper>

        {/* Navigation Links - Desktop */}
        <NavLinks>
          <NavButton onClick={() => router.push('/pricing')}>
            Precios
          </NavButton>
          <NavButton onClick={() => router.push('/contact')}>
            Contáctanos
          </NavButton>
        </NavLinks>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex items-center gap-3">
          <Link href="/login">
            <MobileLoginButton>Ingresar</MobileLoginButton>
          </Link>
          <MobileMenuButton 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </MobileMenuButton>
        </div>

        {/* Auth Buttons - Desktop */}
        {showAuthButtons && (
          <AuthButtons className="hidden sm:flex">
            <ThemeToggle onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </ThemeToggle>
            {currentPage !== 'signup' && (
              <Button
                asChild
                variant="secondary"
                className="bg-primary text-white hover:bg-primary/50 relative overflow-hidden shine-btn"
              >
                <Link href="/signup">Empieza gratis!</Link>
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

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <MobileMenuOverlay onClick={() => setIsMobileMenuOpen(false)} />
          <MobileMenuContent>
            <MobileMenuHeader>
              <BrandLogo />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-white/80 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <X size={24} />
              </button>
            </MobileMenuHeader>
            
            <MobileMenuBody>
              <div className="space-y-2">
                <MobileNavButton onClick={() => {
                  router.push('/pricing')
                  setIsMobileMenuOpen(false)
                }}>
                  Precios
                </MobileNavButton>
                
                <MobileNavButton onClick={() => {
                  router.push('/contact')
                  setIsMobileMenuOpen(false)
                }}>
                  Contáctanos
                </MobileNavButton>
                
                <MenuDivider />
                
                {showAuthButtons && currentPage !== 'signup' && (
                  <div className="px-4 py-2">
                    <Button
                      asChild
                      variant="default"
                      className="w-full bg-white text-primary hover:bg-white/90 font-semibold py-3 dark:bg-primary dark:text-white dark:hover:bg-primary/90"
                      onClick={() => {
                        router.push('/signup')
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <Link href="/signup">Empieza gratis!</Link>
                    </Button>
                  </div>
                )}
                
                <MobileThemeToggle onClick={() => {
                  toggleTheme()
                  setIsMobileMenuOpen(false)
                }}>
                  {theme === 'dark' ? (
                    <>
                      <Sun size={20} />
                      Modo claro
                    </>
                  ) : (
                    <>
                      <Moon size={20} />
                      Modo oscuro
                    </>
                  )}
                </MobileThemeToggle>
              </div>
            </MobileMenuBody>
            
            <MobileMenuFooter>
              <div className="text-center text-white/60 text-sm">
                © MIDI 2025
              </div>
            </MobileMenuFooter>
          </MobileMenuContent>
        </>
      )}
    </>
  )
}

// Styled components
const Header = tw.header`
  flex items-center justify-between px-6 py-4 relative z-10 pb-8
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

const MobileMenuButton = tw.button`
  text-white/80 hover:text-white transition-all duration-200 cursor-pointer
  p-2 rounded-lg hover:bg-white/10 
`

const MobileLoginButton = tw.button`
  text-white/90 hover:text-white transition-all duration-200 cursor-pointer
  px-4 py-2 rounded-lg font-medium text-sm
  bg-white/10 hover:bg-white/20
  border border-white/20 hover:border-white/40
`

const MobileMenuOverlay = tw.div`
  fixed inset-0 z-40 sm:hidden
  bg-black/60 backdrop-blur-sm
`

const MobileMenuContent = tw.div`
  fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50
  bg-gradient-to-br from-[#0589c2]/95 via-[#3abdd4]/95 to-[#93efff]/95 backdrop-blur-xl
  dark:from-[#0d1421]/95 dark:via-[#1a2332]/95 dark:to-[#2a3441]/95
  border-l border-white/5 dark:border-white/5
  shadow-2xl
  flex flex-col
  transform transition-transform duration-300 ease-out
`

const MobileMenuHeader = tw.div`
  flex items-center justify-between p-6 border-b border-white/20 dark:border-white/10
`

const MobileMenuBody = tw.div`
  flex-1 p-6 overflow-y-auto
`

const MobileNavButton = tw.button`
  w-full text-left text-white/90 hover:text-white transition-all duration-200 cursor-pointer
  px-4 py-4 rounded-xl hover:bg-white/10 font-medium text-lg
  flex items-center gap-3
  border border-transparent hover:border-white/20
`

const MobileThemeToggle = tw.button`
  w-full flex items-center gap-3 text-left text-white/90 hover:text-white transition-all duration-200 cursor-pointer
  px-4 py-4 rounded-xl hover:bg-white/10 font-medium text-lg
  border border-transparent hover:border-white/20
`

const MenuDivider = tw.div`
  h-px bg-white/20 dark:bg-white/10 my-4
`

const MobileMenuFooter = tw.div`
  p-6 border-t border-white/20 dark:border-white/10
`
