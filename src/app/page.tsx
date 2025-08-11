"use client";
import tw from "tailwind-styled-components";
import SharedHeader from "@/components/SharedHeader";
import { useUser } from "@/contexts/UserContext";
import LandingCarousel from "@/components/LandingCarousel";
import Iridescence from "@/components/Iridescence";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { trackEvent } from "@/utils/trackEvent";
import { saveUtmCampaignFromUrl } from "@/db/utmCampaigns";
import "./shine.css";
import TrustStats from "@/components/TrustStats";
import { useTheme } from "@/contexts/ThemeContext";

export default function Home() {
  const { theme } = useTheme();
  const { user, tenant } = useUser();

  useEffect(() => {
    trackEvent("Visited Landing Page", {
      userId: user?.uid,
      tenantId: tenant?.tenantId,
    });
  }, [user?.uid, tenant?.tenantId]);

  useEffect(() => {
    saveUtmCampaignFromUrl();
  }, []);

  return (
    <Wrapper>
      <BackgroundContainer>
        <Iridescence speed={0.3} amplitude={0.08} mouseReact />
      </BackgroundContainer>

      {/* HERO PANEL */}
      <HeroSection>
        <HeroPanel>
          <SharedHeader currentPage="landing" />

          {/* Constrained content row */}
          <HeroInner>
            <HeroGrid>
              <HeroCol>
                <Headline>
                  Gestiona fácilmente tus pacientes, citas y expedientes médicos.
                </Headline>
                <Subheadline>
                  Plataforma moderna y segura para clínicas ambulatorias: agenda
                  inteligente, expedientes centralizados y recordatorios
                  automatizados que reducen ausencias y ahorran horas
                  administrativas.
                </Subheadline>
                <CTAGroup>
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 py-3 text-lg shadow-lg"
                  >
                    <Link href="/signup">Empieza gratis</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:border-slate-400 font-medium px-8 py-3 text-lg transition-colors"
                  >
                    <Link href="/pricing">Ver planes</Link>
                  </Button>
                </CTAGroup>
              </HeroCol>

              <HeroScreenshotCol>
                <ScreenshotInner>
                  <DeviceGroup>
                    <div className="relative">
                      {(() => {
                        const laptopSrc =
                          theme === "dark"
                            ? "/laptopDarkMockup.svg"
                            : "/laptopLightMockup.svg";
                        const phoneSrc =
                          theme === "dark" ? "/mobileDark.svg" : "/mobileLight.svg";
                        return (
                          <>
                            <Image
                              src={laptopSrc}
                              alt="Vista escritorio de la aplicación MidiMed"
                              width={1100}
                              height={620}
                              className="w-[760px] md:w-[880px] lg:w-[1000px] xl:w-[1100px] max-w-full h-auto"
                              priority
                            />
                            <Image
                              src={phoneSrc}
                              alt="Vista móvil de la aplicación MidiMed"
                              width={170}
                              height={360}
                              className="absolute right-12 bottom-8 w-[140px] md:w-[150px] lg:w-[155px] h-auto"
                              priority
                            />
                          </>
                        );
                      })()}
                    </div>
                  </DeviceGroup>
                </ScreenshotInner>
              </HeroScreenshotCol>
            </HeroGrid>
          </HeroInner>

          {/* FULL-BLEED STATS STRIP (covers entire panel width) */}
          <StatsFullBleed>
            <StatsContainer>
              <StatsInnerGrid>
                <StatsLeft>
                  <TrustStats variant="heroFull" />
                </StatsLeft>
                <StatsRight />
              </StatsInnerGrid>
            </StatsContainer>
          </StatsFullBleed>
        </HeroPanel>
      </HeroSection>

      {/* FEATURES */}
      <CarouselSection>
        <CarouselInner>
          <SectionTitle>Lo que puedes hacer con MidiMed</SectionTitle>
          <LandingCarousel />
        </CarouselInner>
      </CarouselSection>
    </Wrapper>
  );
}

/* ===== LAYOUT ===== */
const Wrapper = tw.div`min-h-[100dvh] flex flex-col relative`;
const BackgroundContainer = tw.div`absolute inset-0 w-full h-full pointer-events-none z-0`;

const HeroSection = tw.section`relative z-10 w-full`;
const HeroPanel = tw.div`
  relative w-full
  bg-slate-50/90 dark:bg-slate-950/85 backdrop-blur-sm
  shadow-md dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
`;
const HeroInner = tw.div`
  w-full mx-auto max-w-[1680px]
  px-3 sm:px-8 xl:px-14 2xl:px-20
`;
const HeroGrid = tw.div`
  grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]
  gap-10 xl:gap-14 items-center min-h-[480px] pb-8 md:pb-0
`;

const HeroCol = tw.div`flex flex-col gap-6 justify-center pr-0 lg:pr-8`;
const HeroScreenshotCol = tw.div`hidden md:flex items-center justify-center`;
const ScreenshotInner = tw.div`relative flex items-center justify-center`;

const CTAGroup = tw.div`flex flex-wrap items-center gap-4`;
const Headline = tw.h1`text-5xl sm:text-6xl font-bold leading-tight text-slate-900 dark:text-white max-w-[900px]`;
const Subheadline = tw.p`text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-[720px]`;

/* ===== FULL-BLEED STATS STRIP ===== */
const StatsFullBleed = tw.div`
  w-full bg-primary text-white relative
`;
const StatsContainer = tw.div`
  w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20
`;
const StatsInnerGrid = tw.div`
  grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,6fr)]
`;
const StatsLeft = tw.div``;
const StatsRight = tw.div`
  hidden lg:block
`;

const DeviceGroup = tw.div`
  relative flex items-end justify-center translate-y-6 sm:translate-y-8 lg:translate-y-10 xl:translate-y-12 z-10
  scale-110 sm:scale-120 lg:scale-135 xl:scale-140
`;

/* ===== BELOW-HERO ===== */
const CarouselSection = tw.section`relative z-10 w-full mt-4 px-6 sm:px-12 pb-16`;
const CarouselInner = tw.div`max-w-6xl mx-auto flex flex-col items-center`;
const SectionTitle = tw.h2`text-center text-white/80 text-sm uppercase tracking-wider mb-6 font-semibold`;
