'use client'

export default function StructuredData() {
  const organizationData = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "MidiMed",
    "legalName": "MidiMed Software Médico",
    "url": "https://midimed.tech",
    "logo": "https://midimed.tech/logo.svg",
    "description": "Software médico integral para consultorios y clínicas. Gestiona pacientes, agenda médica digital, expedientes electrónicos e historias clínicas con automatización IA.",
    "foundingDate": "2024",
    "industry": "Healthcare Software",
    "address": {
      "@type": "PostalAddress",
      "addressCountry": "MX",
      "addressLocality": "México"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "Customer Service",
      "url": "https://midimed.tech/contact",
      "availableLanguage": ["Spanish", "English"]
    },
    "sameAs": [
      "https://twitter.com/midimed"
    ],
    "offers": {
      "@type": "Offer",
      "category": "Medical Practice Management Software",
      "itemOffered": {
        "@type": "SoftwareApplication",
        "name": "MidiMed",
        "applicationCategory": "HealthApplication",
        "operatingSystem": "Web-based",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
          "description": "Free trial available"
        }
      }
    }
  };

  const softwareData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "MidiMed",
    "applicationCategory": "HealthApplication",
    "operatingSystem": "Web-based",
    "description": "Software médico integral para gestión clínica: agenda digital, expedientes electrónicos, automatización IA y gestión de pacientes para consultorios y clínicas.",
    "url": "https://midimed.tech",
    "downloadUrl": "https://midimed.tech/signup",
    "screenshot": "https://midimed.tech/screenshot.png",
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "author": {
      "@type": "Organization",
      "name": "MidiMed"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "priceValidUntil": "2025-12-31",
      "availability": "https://schema.org/InStock",
      "description": "Free trial available"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "Agenda médica digital",
      "Gestión de pacientes", 
      "Expedientes electrónicos",
      "Historia clínica digital",
      "Automatización con IA",
      "Reportes y analítica",
      "Comunicación con pacientes",
      "Cumplimiento normativo"
    ]
  };

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "¿Qué es MidiMed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MidiMed es un software médico integral diseñado para consultorios y clínicas que automatiza la gestión de pacientes, agenda médica digital, expedientes electrónicos e historias clínicas con inteligencia artificial."
        }
      },
      {
        "@type": "Question", 
        "name": "¿Cómo ayuda MidiMed a los médicos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "MidiMed ayuda a los médicos a recuperar tiempo automatizando tareas administrativas, centralizando la gestión de pacientes, generando resúmenes clínicos automáticos con IA y optimizando la agenda médica digital."
        }
      },
      {
        "@type": "Question",
        "name": "¿Es seguro usar MidiMed para expedientes médicos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Sí, MidiMed cumple con todas las normativas de seguridad y privacidad médica, garantizando la protección completa de los datos de pacientes y el cumplimiento regulatorio."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  );
}