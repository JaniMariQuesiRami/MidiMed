"use client";
import tw from "tailwind-styled-components";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <Section>
      <Background>
        <Inner>
          <Content>
            <Headline>Comienza hoy y recupera tiempo para lo que importa</Headline>
            <Subcopy>
              Únete a cientos de clínicas en Latinoamérica que ya usan MidiMed para automatizar 
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
                className="border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-500 dark:text-slate-100 dark:hover:bg-slate-800/70 dark:hover:border-slate-400 font-medium px-8 py-3 text-lg transition-colors"
              >
                <Link href="/pricing">Ver planes</Link>
              </Button>
            </CTAGroup>
          </Content>
        </Inner>
      </Background>
    </Section>
  );
}

// Styled
const Section = tw.section`w-full relative pt-8 md:pt-12`;
const Background = tw.div`
  w-full 
  bg-gradient-to-br from-primary via-primary to-highlight
  dark:from-slate-900 dark:via-slate-800 dark:to-slate-700
  text-white
  py-16 md:py-20
`;
const Inner = tw.div`w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20`;
const Content = tw.div`text-center max-w-4xl mx-auto`;
const Headline = tw.h2`text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6`;
const Subcopy = tw.p`text-lg sm:text-xl text-white/90 leading-relaxed mb-8`;
const CTAGroup = tw.div`flex flex-wrap items-center justify-center gap-4`;
