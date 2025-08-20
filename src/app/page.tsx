"use client";
import tw from "tailwind-styled-components";
import SharedHeader from "@/components/SharedHeader";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { useEffect } from "react";
import { trackEvent } from "@/utils/trackEvent";
import { saveUtmCampaignFromUrl } from "@/db/utmCampaigns";
import "./shine.css";
import TrustStats from "@/components/TrustStats";
import { useTheme } from "@/contexts/ThemeContext";
import FeatureHighlights from "@/components/FeatureHighlights";
import DetailedFeatures from "@/components/DetailedFeatures";
import ValueStripe from "@/components/ValueStripe";
import WhyMidiMed from "@/components/WhyMidiMed";
import PricingSection from "@/components/PricingSection";
import ContactSection from "@/components/ContactSection";
import FinalCTA from "@/components/FinalCTA";
import FAQ from "@/components/FAQ";
import Testimonials from "@/components/Testimonials";
import SupportCTA from "@/components/SupportCTA";
import FooterColumns from "@/components/FooterColumns";
import BottomLegalBar from "@/components/BottomLegalBar";

export default function Home() {
  const { theme } = useTheme();
  const { user, tenant } = useUser();

  const handlePricingClick = () => {
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  }

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
      <SharedHeader currentPage="landing" />
      <BackgroundContainer>
        {/* Background visual removed for now */}
      </BackgroundContainer>

      {/* HERO PANEL */}
      <HeroSection>
        <HeroPanel>
          <HeaderSpacer />

          {/* Constrained content row */}
          <HeroInner>
            <HeroGrid>
              <HeroCol>
                <Headline>
                  <span className="block">
                    <span className="text-highlight font-semibold">Recupera tiempo</span>
                    :
                  </span>
                  <span className="block">
                    Enfócate en tus{" "}
                    <span className="text-highlight font-semibold">pacientes</span>
                  </span>
                  <span className="block">
                    y en tu{" "}
                    <span className="text-highlight font-semibold">vida</span>
                  </span>
                </Headline>
                <Subheadline>
                  Automatizamos agenda, expedientes y aumentamos tu productividad con IA para devolverte horas y permitirte equilibrar mejor tu práctica y tu vida personal.
                </Subheadline>
                <CTAGroup>
                  <Button
                    asChild
                    size="lg"
                    className="bg-primary text-white hover:bg-primary/90 font-semibold px-8 py-3 text-lg shadow-lg relative overflow-hidden shine-btn"
                  >
                    <Link href="/signup">Empieza gratis</Link>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:border-slate-400 font-medium px-8 py-3 text-lg transition-colors"
                  >
                    <button onClick={handlePricingClick}>Ver planes</button>
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
                              className="w-[760px] md:w-[820px] lg:w-[1000px] xl:w-[1100px] max-w-full h-auto lg:hidden xl:block"
                              priority
                            />
                            <Image
                              src={phoneSrc}
                              alt="Vista móvil de la aplicación MidiMed"
                              width={170}
                              height={360}
                              className="absolute right-12 bottom-8 w-[140px] md:w-[140px] lg:w-[200px] h-auto lg:relative lg:right-auto lg:bottom-auto xl:absolute xl:right-12 xl:bottom-8 xl:w-[155px] 2xl:block"
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

      {/* FEATURE HIGHLIGHTS */}
      <FeatureHighlights />
      <DetailedFeatures />
      <ValueStripe />
      <WhyMidiMed />
      <PricingSection />
      <FinalCTA />
      <FAQ />
      <Testimonials />
      <SupportCTA />
      <ContactSection />
      <FooterColumns />
      <BottomLegalBar />
    </Wrapper>
  );
}

/* ===== LAYOUT ===== */
const Wrapper = tw.div`min-h-[100dvh] flex flex-col relative overflow-x-hidden`;
const BackgroundContainer = tw.div`absolute inset-0 w-full h-full pointer-events-none z-0`;

const HeroSection = tw.section`relative z-10 w-full overflow-x-hidden`;
const HeroPanel = tw.div`
  relative w-full
  bg-gradient-to-b from-[#dbeef9] to-[#e3e7f2] dark:from-[#0f2530] dark:to-[#163544]
  backdrop-blur-sm
  shadow-md ring-1 ring-[#8cc9d9]/50 dark:ring-[#0f2530] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.04)]
  overflow-x-hidden
`;
const HeroInner = tw.div`
  w-full mx-auto max-w-[1680px]
  px-3 sm:px-8 xl:px-14 2xl:px-20
`;
const HeroGrid = tw.div`
  grid grid-cols-1 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]
  gap-10 xl:gap-14 items-center min-h-[560px] pb-8 md:pb-0
`;

const HeroCol = tw.div`flex flex-col gap-6 justify-center pr-0 lg:pr-8`;
const HeroScreenshotCol = tw.div`hidden md:flex items-center justify-center`;
const ScreenshotInner = tw.div`relative flex items-center justify-center`;

const CTAGroup = tw.div`flex flex-wrap items-center gap-4`;
const Headline = tw.h1`text-5xl sm:text-6xl font-bold leading-tight text-slate-900 dark:text-white max-w-[720px]`;
const Subheadline = tw.p`text-lg sm:text-xl text-slate-700 dark:text-slate-300 leading-relaxed max-w-[660px]`;

/* ===== FULL-BLEED STATS STRIP ===== */
const StatsFullBleed = tw.div`
  w-full bg-primary text-white relative md:mt-8 lg:mt-0 overflow-x-hidden
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
  relative flex items-end justify-center translate-y-8 sm:translate-y-12 md:translate-y-0 lg:translate-y-16 xl:translate-y-20 z-10
  lg:-translate-x-6 xl:-translate-x-6 2xl:translate-x-0
  scale-115 sm:scale-130 md:scale-100 lg:scale-145 xl:scale-150
`;

const HeaderSpacer = tw.div`
  h-20 w-full
`;
