"use client";

import tw from "tailwind-styled-components";
import { useTheme } from "@/contexts/ThemeContext";

type Stat = { value: string; label: string };

const stats: Stat[] = [
  { value: "-40%", label: "Menos tiempo en tareas administrativas" },
  { value: "+20%", label: "Mayor puntualidad en citas" },
  { value: "100%", label: "Datos cifrados y protegidos" }
];

interface TrustStatsProps {
  variant?: "default" | "heroFull";
}

export default function TrustStats({ variant = "default" }: TrustStatsProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const hero = variant === "heroFull";

  if (hero) {
    return (
      <HeroGrid aria-label="Métricas de confianza">
        {stats.map((s) => (
          <HeroCell key={s.label}>
            <HeroValue>{s.value}</HeroValue>
            <HeroLabel>{s.label}</HeroLabel>
          </HeroCell>
        ))}
      </HeroGrid>
    );
  }

  return (
    <CardWrapper aria-label="Métricas de confianza" $dark={isDark}>
      <CardGrid>
        {stats.map((s) => (
          <CardCell key={s.label}>
            <CardValue>{s.value}</CardValue>
            <CardLabel>{s.label}</CardLabel>
          </CardCell>
        ))}
      </CardGrid>
    </CardWrapper>
  );
}

/* ===== HERO (content only; background provided by page) ===== */
const HeroGrid = tw.div`
  grid grid-cols-3 text-white
  -ml-2 sm:-ml-3 /* keep alignment with headline */
`;

const HeroCell = tw.div`
  relative py-4 sm:py-5 text-center
  px-2 sm:px-3
  before:content-[''] before:absolute before:top-2 before:bottom-2 before:left-0 before:w-[2px]
  before:bg-white/30 first:before:hidden
`;
const HeroValue = tw.div`text-3xl sm:text-5xl font-extrabold leading-none tracking-tight`;
const HeroLabel = tw.div`mt-1 text-xs sm:text-sm uppercase tracking-wide text-white/80`;


/* ===== COMPACT CARD ===== */
const CardWrapper = tw.div<{ $dark: boolean }>`
  mt-6 w-full max-w-[560px] rounded-xl shadow-lg ring-1 overflow-hidden
  ${(p) => (p.$dark ? "bg-white/5 ring-white/10 text-white" : "bg-primary text-white ring-black/5")}
`;
const CardGrid = tw.div`
  grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-white/15
`;
const CardCell = tw.div`p-4 sm:p-5 text-center`;
const CardValue = tw.div`text-3xl font-extrabold leading-none tracking-tight`;
const CardLabel = tw.div`mt-1 text-[11px] uppercase tracking-wide text-white/80`;
