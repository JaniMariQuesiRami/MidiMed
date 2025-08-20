'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'
import BrandLogo from '@/components/BrandLogo'
import { Button } from '@/components/ui/button'
import tw from 'tailwind-styled-components'
import { useState, useEffect } from 'react'

type SharedHeaderProps = {
  showAuthButtons?: boolean
  currentPage?: 'landing' | 'login' | 'signup'
}

export default function SharedHeader({ showAuthButtons = true, currentPage = 'landing' }: SharedHeaderProps) {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isScrolling, setIsScrolling] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const scrollTop = window.scrollY
      setIsScrolled(scrollTop > 20)
      setIsScrolling(true)
      
      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150) // Stop scrolling state after 150ms of no scroll
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  const handleHomeClick = () => {
    if (pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push('/');
    }
  }

  const handlePricingClick = () => {
    if (pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/pricing');
    }
  }

  const handleContactClick = () => {
    if (pathname === '/') {
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      router.push('/contact');
    }
  }

  return (
    <>
      <Header 
        $isScrolled={isScrolled} 
        $isHovered={isHovered} 
        $isScrolling={isScrolling}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <HeaderInner>
          {/* Logo - clickable to go to landing */}
          <LogoWrapper onClick={handleHomeClick}>
            <BrandLogo />
          </LogoWrapper>

          {/* Navigation Links - Desktop */}
          <NavLinks>
            <NavButton $active={pathname === '/'} onClick={handleHomeClick}>Inicio</NavButton>
            <NavButton $active={pathname.startsWith('/pricing')} onClick={handlePricingClick}>
              Precios
            </NavButton>
            <NavButton $active={pathname.startsWith('/contact')} onClick={handleContactClick}>
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
        </HeaderInner>
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
                <MobileNavButton $active={pathname === '/'} onClick={() => {
                  handleHomeClick()
                  setIsMobileMenuOpen(false)
                }}>
                  Inicio
                </MobileNavButton>
                <MobileNavButton $active={pathname.startsWith('/pricing')} onClick={() => {
                  handlePricingClick()
                  setIsMobileMenuOpen(false)
                }}>
                  Precios
                </MobileNavButton>
                <MobileNavButton $active={pathname.startsWith('/contact')} onClick={() => {
                  handleContactClick()
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
const Header = tw.header<{ $isScrolled?: boolean; $isHovered?: boolean; $isScrolling?: boolean }>`
  w-full fixed top-0 left-0 z-50 transition-all duration-300
  ${({ $isScrolled, $isHovered, $isScrolling }) => {
    if (!$isScrolled) return 'bg-transparent'
    
    // When scrolled but not hovered and not actively scrolling - more transparent
    if ($isScrolled && !$isHovered && !$isScrolling) {
      return 'bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm shadow-md border-b border-slate-200/30 dark:border-slate-700/30'
    }
    
    // When scrolled and (hovered or actively scrolling) - more opaque
    return 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg border-b border-slate-200/50 dark:border-slate-700/50'
  }}
`

const HeaderInner = tw.div`
  w-full px-3 sm:px-8 xl:px-14 2xl:px-20
  flex items-center justify-between py-4
  sm:grid sm:grid-cols-[auto_1fr_auto] sm:items-center
`

const LogoWrapper = tw.div`
  cursor-pointer
`

const NavLinks = tw.nav`
  hidden sm:flex items-center gap-6 justify-center justify-self-center
`

const NavButton = tw.button<{ $active?: boolean }>`
  text-sm font-medium cursor-pointer px-3 py-2 rounded-md font-[600]
  transition-colors relative
  ${(p) => p.$active 
    ? 'text-primary dark:text-primary underline underline-offset-4 decoration-2'
    : 'text-slate-700 dark:text-white/80 hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4'}
`

const AuthButtons = tw.nav`
  flex gap-2 items-center justify-self-end
`

const ThemeToggle = tw.button`
  p-1 rounded cursor-pointer transition-colors
  text-slate-600 hover:text-slate-800 hover:bg-slate-200/50
  dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10
`

const MobileMenuButton = tw.button`
  text-slate-600 hover:text-slate-900 transition-all duration-200 cursor-pointer
  p-2 rounded-lg hover:bg-slate-200/50
  dark:text-white/80 dark:hover:text-white dark:hover:bg-white/10
`

const MobileLoginButton = tw.button`
  text-slate-700 hover:text-slate-900 transition-all duration-200 cursor-pointer
  px-4 py-2 rounded-lg font-medium text-sm
  bg-slate-200/70 hover:bg-slate-300/70 border border-slate-300/70
  dark:bg-white/10 dark:hover:bg-white/20 dark:text-white/90 dark:border-white/20 dark:hover:border-white/40
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

const MobileNavButton = tw.button<{ $active?: boolean }>`
  w-full text-left transition-all duration-200 cursor-pointer
  px-4 py-4 font-medium text-lg flex items-center gap-3
  border border-transparent
  ${(p)=> p.$active 
    ? 'text-primary dark:text-primary underline underline-offset-4 decoration-2' 
    : 'text-white/90 hover:text-white hover:underline underline-offset-4'}
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
