"use client";
import tw from "tailwind-styled-components";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "¿Qué incluye el plan gratuito?",
    a: "El plan gratuito incluye gestión básica de agenda para hasta 50 pacientes, recordatorios automáticos por email, y acceso a expedientes digitales básicos."
  },
  {
    q: "¿Es seguro almacenar información médica en MidiMed?",
    a: "Sí, cumplimos con estándares internacionales de seguridad. Todos los datos están encriptados y almacenados en servidores certificados con respaldo automático."
  },
  {
    q: "¿Puedo migrar mis datos desde otro sistema?",
    a: "Absolutamente. Nuestro equipo te ayuda a importar pacientes, citas y expedientes desde Excel, otros software médicos o sistemas existentes sin costo adicional."
  },
  {
    q: "¿Funciona en dispositivos móviles?",
    a: "Sí, MidiMed es completamente responsive y funciona en cualquier dispositivo: computadora, tablet o smartphone, desde cualquier navegador moderno."
  },
  {
    q: "¿Ofrecen capacitación para mi equipo?",
    a: "Incluimos capacitación inicial sin costo, tutoriales en video, documentación completa y soporte técnico en español durante horarios comerciales."
  },
  {
    q: "¿Puedo cancelar mi suscripción en cualquier momento?",
    a: "Sí, puedes cancelar cuando quieras sin penalizaciones. Mantienes acceso completo hasta el final de tu período de facturación actual."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <Section>
      <Inner>
        <Header>
          <Title>Preguntas frecuentes</Title>
          <Subtitle>Resuelve tus dudas sobre MidiMed</Subtitle>
        </Header>
        <FAQList>
          {faqs.map((faq, index) => (
            <FAQItem key={index}>
              <QuestionButton
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                $isOpen={openIndex === index}
              >
                <QuestionText>{faq.q}</QuestionText>
                <ChevronIcon $isOpen={openIndex === index}>
                  <ChevronDown className="w-5 h-5" />
                </ChevronIcon>
              </QuestionButton>
              {openIndex === index && (
                <Answer>{faq.a}</Answer>
              )}
            </FAQItem>
          ))}
        </FAQList>
      </Inner>
    </Section>
  );
}

// Styled
const Section = tw.section`w-full relative pt-8 md:pt-12`;
const Inner = tw.div`w-full mx-auto max-w-[1680px] px-3 sm:px-8 xl:px-14 2xl:px-20`;
const Header = tw.div`text-center max-w-3xl mx-auto mb-12`;
const Title = tw.h2`text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-4`;
const Subtitle = tw.p`text-lg text-slate-600 dark:text-slate-400`;

const FAQList = tw.div`max-w-4xl mx-auto space-y-4`;
const FAQItem = tw.div`rounded-xl bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm ring-1 ring-slate-200/60 dark:ring-white/10 overflow-hidden`;
const QuestionButton = tw.button<{ $isOpen: boolean }>`
  w-full text-left p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-700/30 transition-colors
  ${(p) => p.$isOpen ? 'bg-slate-50/50 dark:bg-slate-700/30' : ''}
`;
const QuestionText = tw.span`text-lg font-semibold text-slate-900 dark:text-white pr-4`;
const ChevronIcon = tw.span<{ $isOpen: boolean }>`
  text-slate-500 transition-transform duration-200
  ${(p) => p.$isOpen ? 'rotate-180' : ''}
`;
const Answer = tw.div`px-6 pb-6 text-slate-700 dark:text-slate-300 leading-relaxed`;
