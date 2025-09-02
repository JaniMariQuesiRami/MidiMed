"use client";
import tw from "tailwind-styled-components";
import SharedHeader from "@/components/SharedHeader";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { trackEvent } from "@/utils/trackEvent";
import { saveUtmCampaignFromUrl } from "@/db/utmCampaigns";
import "./shine.css";
import TrustStats from "@/components/TrustStats";
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
                  <VideoContainer>
                    <iframe
                      width="800"
                      height="450"
                      src="https://www.youtube.com/embed/yycOoffqSDw"
                      title="MidiMed Demo - Software médico para consultorios"
                      frameBorder="0"
                      style={{ border: 'none' }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg border-0"
                    ></iframe>
                  </VideoContainer>
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
const HeroScreenshotCol = tw.div`flex items-center justify-center`;

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

const VideoContainer = tw.div`
  relative w-full max-w-[90vw] sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] xl:max-w-[900px] aspect-video
  translate-y-4 sm:translate-y-6 md:translate-y-0 lg:translate-y-8 xl:translate-y-12 z-10
  scale-100 sm:scale-105 lg:scale-110 xl:scale-115
  mx-auto mb-8 sm:mb-12 md:mb-24 md:mr-8
`;

const HeaderSpacer = tw.div`
  h-20 w-full
`;
