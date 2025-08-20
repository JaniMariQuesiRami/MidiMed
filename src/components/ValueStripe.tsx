"use client";
import tw from "tailwind-styled-components";

export default function ValueStripe() {
  return (
    <Section>
      <StripeBg>
        <Inner>
          <Headline>Menos tiempo administrativo, más tiempo con pacientes</Headline>
        </Inner>
      </StripeBg>
    </Section>
  );
}

// Styled
const Section = tw.section`w-full relative pt-8 md:pt-12`;
const StripeBg = tw.div`
  w-full
  bg-gradient-to-r from-primary/90 to-primary
  dark:from-slate-900 dark:to-slate-800
  text-white
`;
const Inner = tw.div`w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20`;
const Headline = tw.h2`py-10 md:py-14 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-center`;
