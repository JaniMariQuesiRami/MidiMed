"use client";
import tw from "tailwind-styled-components";
import { CheckCircle2, Clock, Shield } from "lucide-react";

export default function WhyMidiMed() {
  return (
    <Section aria-labelledby="why-title">
      <Inner>
        <Grid>
          <Media>
            <MediaInner>
              <PlaceholderText>Imagen / Mockup</PlaceholderText>
            </MediaInner>
          </Media>
          <Content>
            <Eyebrow>¿Por qué elegir nuestro software médico?</Eyebrow>
            <Title id="why-title">Plataforma médica diseñada para devolverte tiempo y mejorar tu práctica</Title>
            <Intro>
              MidiMed es el software de gestión clínica más completo para consultorios y clínicas modernas. Combina agenda médica digital, expedientes electrónicos seguros y automatización con IA para transformar cómo gestionas tu práctica médica y te relacionas con tus pacientes.
            </Intro>
            <Points>
              <Point>
                <IconWrap>
                  <Clock className="w-5 h-5" />
                </IconWrap>
                <div>
                  <PointTitle>Elimina trabajo administrativo repetitivo</PointTitle>
                  <PointDesc>Automatización médica inteligente: recordatorios automáticos, reprogramación de citas y tareas administrativas sin intervención manual.</PointDesc>
                </div>
              </Point>
              <Point>
                <IconWrap>
                  <CheckCircle2 className="w-5 h-5" />
                </IconWrap>
                <div>
                  <PointTitle>Historia clínica digital estandarizada</PointTitle>
                  <PointDesc>Expedientes electrónicos con formatos médicos estándar que garantizan continuidad clínica y cumplimiento normativo completo.</PointDesc>
                </div>
              </Point>
              <Point>
                <IconWrap>
                  <Shield className="w-5 h-5" />
                </IconWrap>
                <div>
                  <PointTitle>Decisiones médicas basadas en datos</PointTitle>
                  <PointDesc>Analítica médica avanzada con indicadores de consultorios, reportes automáticos y métricas que revelan oportunidades de mejora.</PointDesc>
                </div>
              </Point>
            </Points>
          </Content>
        </Grid>
      </Inner>
    </Section>
  );
}

// Styled
const Section = tw.section`w-full relative pt-8 md:pt-12 pb-8`;
const Inner = tw.div`w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20`;
const Grid = tw.div`grid items-center gap-8 md:gap-12 grid-cols-1 md:grid-cols-2`;

const Media = tw.div``;
const MediaInner = tw.div`relative aspect-[16/10] w-full rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-primary/0 ring-1 ring-primary/20 dark:from-primary/10 dark:via-primary/5 dark:to-transparent flex items-center justify-center`;
const PlaceholderText = tw.div`text-sm font-medium text-slate-500 dark:text-slate-400`;

const Content = tw.div`flex flex-col gap-5`;
const Eyebrow = tw.span`text-highlight text-base sm:text-lg font-semibold tracking-wide uppercase`;
const Title = tw.h3`text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 dark:text-white`;
const Intro = tw.p`text-base sm:text-lg text-slate-700 dark:text-slate-300 max-w-prose`;

const Points = tw.ul`mt-2 space-y-4`;
const Point = tw.li`flex items-start gap-3`;
const IconWrap = tw.span`mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary`;
const PointTitle = tw.h4`text-lg sm:text-xl font-semibold text-slate-900 dark:text-white`;
const PointDesc = tw.p`text-base sm:text-lg text-slate-600 dark:text-slate-300`;
