"use client";
import tw from "tailwind-styled-components";
import { ReactNode } from "react";
import { Sparkles, CalendarDays, FileText, BarChart3 } from "lucide-react";

interface FeatureItemProps {
  icon: ReactNode;
  title: string;
  desc: string;
}

const features: FeatureItemProps[] = [
  {
    icon: <CalendarDays className="w-6 h-6" />,
    title: "Agenda médica digital inteligente",
    desc: "Sistema de citas médicas online con programación automática, recordatorios y gestión centralizada para optimizar el flujo de pacientes.",
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: "Expedientes electrónicos unificados",
    desc: "Historia clínica digital completa y segura con acceso instantáneo desde cualquier dispositivo, cumpliendo normativas médicas.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Automatización médica con IA",
    desc: "Inteligencia artificial médica que genera resúmenes clínicos automáticos, reduce trabajo administrativo y mejora la documentación.",
  },
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: "Reportes clínicos y analítica médica",
    desc: "Métricas de consultorios, estadísticas de pacientes y reportes médicos automatizados para decisiones basadas en datos.",
  },
];

export default function FeatureHighlights() {
  return (
    <Section aria-labelledby="features-heading">
      <Inner>
        <HeaderBlock>
          <Eyebrow>Software Médico Integral</Eyebrow>
          <Title id="features-heading">Sistema completo de gestión clínica para consultorios modernos</Title>
          <Intro>
            Plataforma médica todo-en-uno que optimiza la gestión de pacientes, automatiza expedientes electrónicos y transforma la experiencia clínica con inteligencia artificial diseñada específicamente para profesionales de la salud.
          </Intro>
        </HeaderBlock>

        <Grid>
          {features.map((f) => (
            <Card key={f.title} className="group">
              <IconWrap className="group-hover:scale-105">
                {f.icon}
              </IconWrap>
              <CardTitle>{f.title}</CardTitle>
              <CardDesc>{f.desc}</CardDesc>
            </Card>
          ))}
        </Grid>
      </Inner>
    </Section>
  );
}

/* Styled */
const Section = tw.section`
  w-full pt-8 md:pt-12 relative
  bg-slate-50/40 dark:bg-slate-900/40
`;
const Inner = tw.div`
  w-full mx-auto max-w-[1680px]
  px-3 sm:px-8 xl:px-14 2xl:px-20
`;
const HeaderBlock = tw.div`max-w-3xl mb-14`;
const Eyebrow = tw.span`text-primary font-semibold uppercase tracking-wide text-xs sm:text-sm`;
const Title = tw.h2`mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-slate-900 dark:text-white`;
const Intro = tw.p`mt-4 text-lg text-slate-700 dark:text-slate-300 leading-relaxed`;

const Grid = tw.div`
  grid gap-6 sm:gap-8
  grid-cols-1 sm:grid-cols-2 lg:grid-cols-4
`;
const Card = tw.div`
  relative rounded-xl p-6 flex flex-col
  bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm
  ring-1 ring-slate-200/60 dark:ring-white/10
  shadow-sm hover:shadow-md transition
  hover:ring-primary/40
`;
const IconWrap = tw.div`
  w-12 h-12 mb-5 rounded-full flex items-center justify-center
  bg-primary/10 dark:bg-primary/20 text-primary
  transition-transform
`;
const CardTitle = tw.h3`text-lg font-semibold text-slate-900 dark:text-white mb-2 leading-snug`;
const CardDesc = tw.p`text-sm text-slate-600 dark:text-slate-300 leading-relaxed`;
