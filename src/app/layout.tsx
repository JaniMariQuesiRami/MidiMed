import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { UserProvider } from '@/contexts/UserContext'
import { Toaster } from "sonner";

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
  title:
    "MidiMed - Gestiona fácilmente tus pacientes, citas y expedientes médicos",
  description:
    "Gestiona fácilmente tus pacientes, citas y expedientes médicos.",
  keywords: [
    "pacientes",
    "citas",
    "expedientes médicos",
    "gestión clínica",
    "MidiMed",
  ],
  authors: [{ name: "MidiMed" }],
  openGraph: {
    title:
      "MidiMed - Gestiona fácilmente tus pacientes, citas y expedientes médicos",
    description:
      "Gestiona fácilmente tus pacientes, citas y expedientes médicos.",
    url: "https://midimed.app",
    siteName: "MidiMed",
    images: [
      {
        url: "/logoPrimary.svg",
        width: 800,
        height: 600,
        alt: "MidiMed logo",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title:
      "MidiMed - Gestiona fácilmente tus pacientes, citas y expedientes médicos",
    description:
      "Gestiona fácilmente tus pacientes, citas y expedientes médicos.",
    images: ["/logoPrimary.svg"],
    creator: "@midimed",
  },
  icons: {
    icon: "/logo.svg",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${sourceSansPro.variable} font-sans antialiased`}
      >
        <UserProvider>
          {children}
          <Toaster richColors position="top-right" />
        </UserProvider>
      </body>
    </html>
  );
}