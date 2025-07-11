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
  title: "MidiMed",
  description: "Gestión moderna de pacientes y citas para clínicas y consultorios.",
  icons: {
    icon: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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