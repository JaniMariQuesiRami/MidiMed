import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from '@/contexts/UserContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { Toaster } from "sonner";
import GlobalFooter from '@/components/GlobalFooter'
import PostHogInit from '@/components/PostHogInit'
import StructuredData from '@/components/StructuredData'

const sourceSansPro = localFont({
  variable: "--font-source-sans-pro",
  src: [
    {
      path: "../../node_modules/@fontsource/source-sans-pro/files/source-sans-pro-latin-400-normal.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../node_modules/@fontsource/source-sans-pro/files/source-sans-pro-latin-700-normal.woff2",
      weight: "700",
      style: "normal",
    },
  ],
});


export const metadata: Metadata = {
  title: "MidiMed Tech - Software Médico y Sistema de Gestión Clínica | Agenda, Expedientes y IA",
  description:
    "MidiMed tech: Software médico integral para consultorios y clínicas en México y Guatemala. Gestiona pacientes, agenda médica digital, expedientes electrónicos e historias clínicas con automatización IA. Recupera tiempo y enfócate en tus pacientes.",
  keywords: [
    // Core medical software terms
    "software médico",
    "software clínico", 
    "sistema de gestión clínica",
    "EMR México",
    "EHR español",
    "expedientes electrónicos",
    
    // Scheduling and appointments
    "agenda médica digital",
    "citas médicas online",
    "agendamiento médico",
    "calendario médico",
    
    // Patient management
    "gestión de pacientes",
    "historia clínica digital",
    "expedientes médicos",
    "registros médicos electrónicos",
    
    // Practice management
    "software para consultorios",
    "software para clínicas",
    "gestión clínica",
    "automatización médica",
    "software consultorio médico",
    
    // AI and automation
    "IA médica",
    "automatización clínica",
    "inteligencia artificial medicina",
    "resúmenes clínicos automáticos",
    
    // Regional terms
    "software médico México",
    "software médico Guatemala", 
    "sistema clínico Latinoamérica",
    "sistema clínico Guatemala",
    "software clínico Guatemala",
    "telemedicina",
    "telemedicina Guatemala",
    
    // Brand
    "MidiMed",
    "MidiMed tech", 
    "MidiMed guatemala",
    "MidiMed software",
    "MidiMed Mexico",
  ],
  authors: [{ name: "MidiMed", url: "https://midimed.tech" }],
  creator: "MidiMed",
  publisher: "MidiMed",
  category: "Healthcare Software",
  classification: "Medical Practice Management Software",
  openGraph: {
    title: "MidiMed Tech - Software Médico Integral | Gestión Clínica con IA para Consultorios",
    description:
      "MidiMed tech: Plataforma médica completa para México y Guatemala. Agenda digital, expedientes electrónicos, automatización IA y gestión de pacientes. Diseñado para consultorios y clínicas que buscan eficiencia y mejor atención.",
    url: "https://midimed.tech",
    siteName: "MidiMed",
    images: [
      {
        url: "/screenshot.png",
        width: 1200,
        height: 630,
        alt: "Captura de pantalla del software médico MidiMed mostrando agenda de citas y gestión de pacientes",
      },
    ],
    locale: "es_MX",
    type: "website",
    countryName: "México",
  },
  twitter: {
    card: "summary_large_image",
    title: "MidiMed Tech - Software Médico con IA para Consultorios y Clínicas",
    description:
      "MidiMed tech para México y Guatemala: Gestiona tu práctica médica con eficiencia: agenda digital, expedientes electrónicos y automatización IA. Recupera tiempo, reduce trabajo administrativo.",
    images: ["/screenshot.png"],
    creator: "@midimed",
    site: "@midimed",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
  metadataBase: new URL("https://midimed.tech"),
  alternates: {
    canonical: "https://midimed.tech",
    languages: {
      "es-MX": "https://midimed.tech",
      "es-GT": "https://midimed.tech", 
      "es-ES": "https://midimed.tech",
      "es": "https://midimed.tech",
    },
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="theme-color" content="#3abdd4" />
        <meta name="application-name" content="MidiMed" />
        <meta name="apple-mobile-web-app-title" content="MidiMed" />
        <meta name="msapplication-TileColor" content="#3abdd4" />
        <meta name="format-detection" content="telephone=yes" />
        <meta name="geo.region" content="MX" />
        <meta name="geo.country" content="Mexico" />
        <meta name="geo.placename" content="México" />
        <meta name="geo.region" content="GT" />
        <meta name="geo.country" content="Guatemala" /> 
        <meta name="geo.placename" content="Guatemala" />
        <meta name="category" content="Healthcare Software" />
        <meta name="coverage" content="Worldwide" />
        <meta name="distribution" content="Global" />
        <meta name="rating" content="General" />
        <meta name="target" content="medical professionals, doctors, clinics, healthcare providers" />
        <link rel="canonical" href="https://midimed.tech" />
        <link rel="alternate" hrefLang="es-mx" href="https://midimed.tech" />
        <link rel="alternate" hrefLang="es-gt" href="https://midimed.tech" />
        <link rel="alternate" hrefLang="es-es" href="https://midimed.tech" />
        <link rel="alternate" hrefLang="es" href="https://midimed.tech" />
        <link rel="alternate" hrefLang="x-default" href="https://midimed.tech" />
      </head>
      <body className={`${sourceSansPro.variable} font-sans antialiased`}>
        <ThemeProvider>
          <UserProvider>
            <StructuredData />
            <PostHogInit />
            {children}
            <GlobalFooter />
            <Toaster richColors position="top-right" />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}