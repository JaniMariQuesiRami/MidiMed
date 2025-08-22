'use client';

import Link from 'next/link';

export default function BottomLegalBar() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="w-full bg-slate-100 dark:bg-slate-800 py-4 px-4">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          © {currentYear} MidiMed. Todos los derechos reservados.
          <span className="mx-2">•</span>
          <Link 
            href="/terms" 
            className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Términos de servicio
          </Link>
          <span className="mx-2">•</span>
          <Link 
            href="/privacy" 
            className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            Política de privacidad
          </Link>
        </p>
      </div>
    </div>
  );
}
