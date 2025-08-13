"use client";
import tw from "tailwind-styled-components";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Dr. María González",
    role: "Directora Médica",
    clinic: "Clínica Santa Fe",
    content: "MidiMed transformó completamente nuestra operación. Ahorramos 3 horas diarias en tareas administrativas.",
    rating: 5,
    image: "/placeholder-avatar.jpg" // Placeholder
  },
  {
    name: "Dr. Carlos Mendoza",
    role: "Medicina Interna",
    clinic: "Centro Médico Integral",
    content: "La automatización de expedientes y la IA para resúmenes han mejorado significativamente la calidad de nuestras consultas.",
    rating: 5,
    image: "/placeholder-avatar.jpg" // Placeholder
  },
  {
    name: "Dra. Ana Rodríguez",
    role: "Pediatra",
    clinic: "Consultorio Privado",
    content: "Como consultorio independiente, MidiMed nos permitió competir con clínicas más grandes sin aumentar personal administrativo.",
    rating: 5,
    image: "/placeholder-avatar.jpg" // Placeholder
  }
];

export default function Testimonials() {
  return (
    <Section>
      <Inner>
        <Header>
          <Title>Lo que dicen nuestros usuarios</Title>
          <Subtitle>Médicos de toda Latinoamérica confían en MidiMed</Subtitle>
        </Header>
        <Grid>
          {testimonials.map((testimonial, index) => (
            <Card key={index}>
              <Stars>
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-current text-yellow-400" />
                ))}
              </Stars>
              <Quote>&ldquo;{testimonial.content}&rdquo;</Quote>
              <Author>
                <Avatar />
                <AuthorInfo>
                  <Name>{testimonial.name}</Name>
                  <Role>{testimonial.role} • {testimonial.clinic}</Role>
                </AuthorInfo>
              </Author>
            </Card>
          ))}
        </Grid>
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

const Grid = tw.div`grid gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`;
const Card = tw.div`rounded-xl p-6 bg-white/70 dark:bg-slate-800/50 backdrop-blur-sm ring-1 ring-slate-200/60 dark:ring-white/10`;
const Stars = tw.div`flex gap-1 mb-4`;
const Quote = tw.blockquote`text-slate-700 dark:text-slate-300 leading-relaxed mb-6 italic`;
const Author = tw.div`flex items-center gap-3`;
const Avatar = tw.div`w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 ring-2 ring-primary/20`;
const AuthorInfo = tw.div``;
const Name = tw.div`font-semibold text-slate-900 dark:text-white`;
const Role = tw.div`text-sm text-slate-600 dark:text-slate-400`;
