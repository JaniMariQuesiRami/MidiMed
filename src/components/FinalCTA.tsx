"use client";
import tw from "tailwind-styled-components";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function FinalCTA() {
  const pathname = usePathname();

  const handlePricingClick = () => {
    if (pathname === '/') {
      const pricingSection = document.getElementById('pricing');
      if (pricingSection) {
        pricingSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.location.href = '/pricing';
    }
  }
  return (
    <Section>
      <Background>
        <Inner>
          <Content>
            <Headline>Comienza hoy y recupera tiempo para lo que realmente importa</Headline>
            <Subcopy>
              Únete a cientos de clínicas en Guatemala que ya usan MidiMed para automatizar 
              procesos, mejorar la atención y aumentar la rentabilidad.
            </Subcopy>
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
                className="border-primary text-primary hover:bg-primary hover:text-white dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white font-medium px-8 py-3 text-lg transition-colors"
              >
                <button onClick={handlePricingClick}>Ver planes</button>
              </Button>
            </CTAGroup>
          </Content>
        </Inner>
      </Background>
    </Section>
  );
}

// Styled
const Section = tw.section`w-full relative`;
const Background = tw.div`
  w-full 
  bg-white dark:bg-slate-900
  py-16 md:py-20
  border-b border-slate-200 dark:border-slate-700
`;
const Inner = tw.div`w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20`;
const Content = tw.div`text-center max-w-4xl mx-auto`;
const Headline = tw.h2`text-3xl sm:text-4xl lg:text-5xl font-bold text-primary dark:text-primary mb-6`;
const Subcopy = tw.p`text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed mb-8`;
const CTAGroup = tw.div`flex flex-wrap items-center justify-center gap-4`;
