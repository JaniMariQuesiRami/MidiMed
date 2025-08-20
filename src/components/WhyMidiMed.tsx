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
            <Eyebrow>¿Por qué utilizar MidiMed?</Eyebrow>
            <Title id="why-title">Una plataforma diseñada para devolverte tiempo</Title>
            <Intro>
              MidiMed es una plataforma fácil de usar, segura y accesible para clínicas de todos los tamaños. Mejora el control de agendas, expedientes, recetas, ingresos y más, mientras
              automatiza tareas para que tu equipo se concentre en los pacientes.
            </Intro>
            <Points>
              <Point>
                <IconWrap>
                  <Clock className="w-5 h-5" />
                </IconWrap>
                <div>
                  <PointTitle>Reduce trabajo administrativo</PointTitle>
                  <PointDesc>Recordatorios, reprogramación y tareas repetitivas automatizadas.</PointDesc>
                </div>
              </Point>
              <Point>
                <IconWrap>
                  <CheckCircle2 className="w-5 h-5" />
                </IconWrap>
                <div>
                  <PointTitle>Documentación consistente</PointTitle>
                  <PointDesc>Notas y formatos estandarizados para mejor continuidad clínica.</PointDesc>
                </div>
              </Point>
              <Point>
                <IconWrap>
                  <Shield className="w-5 h-5" />
                </IconWrap>
                <div>
                  <PointTitle>Mejores decisiones con datos</PointTitle>
                  <PointDesc>Indicadores y reportes que muestran ahorros y oportunidades.</PointDesc>
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
