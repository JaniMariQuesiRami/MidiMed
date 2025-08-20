"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import tw from "tailwind-styled-components";

interface DetailedFeature {
  id: string;
  kicker: string;
  title: string;
  description: string;
  points: string[];
  highlights?: string[];
  cta?: { label: string; href: string };
  media?: {
    type: "image" | "placeholder";
    src?: string;
    alt?: string;
  };
}

const FEATURES: DetailedFeature[] = [
  {
    id: "agenda-inteligente",
    kicker: "Agenda inteligente",
    title: "Reduce ausencias y administración",
    description:
      "Recordatorios automáticos y reprogramación asistida para que tu agenda se mantenga llena sin que tengas que perseguir a nadie.",
    points: [
      "Recordatorios multicanal (WhatsApp / Email)",
      "Auto-reprogramación ante cancelaciones",
      "Bloques inteligentes para optimizar huecos",
    ],
    highlights: ["Automática", "Multicanal", "Sin huecos"],
    cta: { label: "Probar agenda", href: "/signup?feature=agenda" },
    media: { type: "placeholder" },
  },
  {
    id: "expediente-unificado",
    kicker: "Expediente clínico",
    title: "Todo el contexto en un solo lugar",
    description:
      "Notas estructuradas, archivos y evolución clínica accesible en segundos para decisiones más rápidas y mejor continuidad de cuidado.",
    points: [
      "Notas estructuradas y libres",
      "Archivos y estudios adjuntos",
      "Búsqueda semántica instantánea",
    ],
    highlights: ["Unificado", "Buscable"],
    cta: { label: "Ver expedientes", href: "/signup?feature=expediente" },
    media: { type: "placeholder" },
  },
  {
    id: "resumenes-ia",
    kicker: "IA clínica",
    title: "Resúmenes listos en segundos",
    description:
      "Genera formatos clínicos (SOAP, notas de evolución) y extrae diagnósticos y planes para que escribas menos y atiendas mejor.",
    points: [
      "Resumen automático de consulta",
      "Extracción de diagnósticos y planes",
      "Edición rápida antes de guardar",
    ],
    highlights: ["Rápido", "Preciso"],
    cta: { label: "Usar IA clínica", href: "/signup?feature=ia" },
    media: { type: "placeholder" },
  },
  {
    id: "coordinacion-equipo",
    kicker: "Coordinación de equipo",
    title: "Tu equipo sincronizado",
    description:
      "Permisos por rol, tareas internas y seguimiento de pendientes para que todos sepan qué sigue y quién es responsable.",
    points: [
      "Roles y permisos granulares",
      "Tareas y notas internas",
      "Historial y trazabilidad",
    ],
    highlights: ["Organizado", "Colaborativo"],
    cta: { label: "Organizar equipo", href: "/signup?feature=equipo" },
    media: { type: "placeholder" },
  },
  {
    id: "analitica-reportes",
    kicker: "Analítica y reportes",
    title: "Mide impacto y crecimiento",
    description:
      "Visualiza productividad, retención y horas ahorradas para optimizar tu práctica y justificar decisiones con datos.",
    points: [
      "Indicadores clave en tiempo real",
      "Reportes exportables",
      "Ahorro de horas cuantificado",
    ],
    highlights: ["Productividad", "Retención"],
    cta: { label: "Ver analítica", href: "/signup?feature=analitica" },
    media: { type: "placeholder" },
  },
];

export default function DetailedFeatures() {
  return (
    <Section>
      <Inner>
        <Stack>
          {FEATURES.map((f, idx) => (
            <FeatureWrapper key={f.id} id={f.id} aria-labelledby={`${f.id}-title`} $tinted={idx % 2 === 1}>
              <FeatureGrid $reverse={idx % 2 === 1}>
                <ContentCol>
                  <HeaderBlock>
                    <Kicker>{f.kicker}</Kicker>
                    <FeatureTitle id={`${f.id}-title`}>{f.title}</FeatureTitle>
                    <Description>{f.description}</Description>
                  </HeaderBlock>
                  <PointsList>
                    {f.points.map(p => (
                      <PointItem key={p}>
                        <PointBullet />
                        <span>{p}</span>
                      </PointItem>
                    ))}
                  </PointsList>
                  {f.highlights && (
                    <HighlightsRow>
                      {f.highlights.map(h => (
                        <HighlightBadge key={h}>{h}</HighlightBadge>
                      ))}
                    </HighlightsRow>
                  )}
                  {f.cta && (
                    <CTAWrap>
                      <Button asChild size="lg" className="font-semibold">
                        <Link href={f.cta.href}>{f.cta.label}</Link>
                      </Button>
                    </CTAWrap>
                  )}
                </ContentCol>
                <MediaCol>
                  <Media feature={f} />
                </MediaCol>
              </FeatureGrid>
            </FeatureWrapper>
          ))}
        </Stack>
      </Inner>
    </Section>
  );
}

/* ========= Styled Components ========= */
const Section = tw.section`relative w-full pt-8 md:pt-12`;
const Inner = tw.div`w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20`;
const Stack = tw.div`flex flex-col gap-10`;

const FeatureWrapper = tw.div<{ $tinted?: boolean }>`
  group relative rounded-3xl p-8 md:p-12 transition-colors
  ${(p) => (p.$tinted ? "bg-slate-50/70 dark:bg-slate-900/40 ring-1 ring-slate-200/60 dark:ring-slate-700/50" : "bg-transparent")}
`;

const FeatureGrid = tw.div<{ $reverse?: boolean }>`
  grid items-start gap-12 md:gap-16 md:grid-cols-[1fr_1fr]
  ${(p) => (p.$reverse ? "md:[&>div:first-child]:order-last" : "")}
`;

const ContentCol = tw.div`flex flex-col gap-6`;
const MediaCol = tw.div``;

const HeaderBlock = tw.div`flex flex-col gap-3`;
const Kicker = tw.span`text-sm font-semibold uppercase tracking-wide text-highlight`;
const FeatureTitle = tw.h2`text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white leading-tight`;
const Description = tw.p`text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-prose`;

const PointsList = tw.ul`space-y-3 text-slate-700 dark:text-slate-300`;
const PointItem = tw.li`flex items-start gap-2`;
const PointBullet = tw.span`mt-1 inline-block h-2 w-2 rounded-full bg-primary`;

const HighlightsRow = tw.div`flex flex-wrap gap-2 pt-2`;
const HighlightBadge = tw.span`rounded-full bg-primary/10 text-primary dark:bg-primary/15 dark:text-primary px-3 py-1 text-xs font-medium`;

const CTAWrap = tw.div`pt-4`;

/* ========= Media ========= */
function Media({ feature }: { feature: DetailedFeature }) {
  if (feature.media?.type === "image" && feature.media.src) {
    return (
      <MediaFrame>
        <Image src={feature.media.src} alt={feature.media.alt || feature.title} fill className="object-cover" />
      </MediaFrame>
    );
  }
  return (
    <MediaPlaceholder>
      <PlaceholderText>Mockup próximamente</PlaceholderText>
    </MediaPlaceholder>
  );
}

const MediaFrame = tw.div`relative aspect-[16/10] w-full overflow-hidden rounded-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/50`;
const MediaPlaceholder = tw.div`relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-primary/0 ring-1 ring-primary/20 dark:from-primary/10 dark:via-primary/5 dark:to-transparent flex items-center justify-center`;
const PlaceholderText = tw.div`text-sm font-medium text-slate-500 dark:text-slate-400`;
