import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Wrench } from 'lucide-react';

export default function EnConstruccion() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <div className="flex items-center space-x-3">
            <Image
              src="/logoLightmode.svg"
              alt="MidiMed Logo"
              width={48}
              height={48}
              className="block dark:hidden"
            />
            <Image
              src="/logo.svg"
              alt="MidiMed Logo"
              width={48}
              height={48}
              className="hidden dark:block"
            />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">MidiMed</span>
          </div>
        </div>

        {/* Construction Icon */}
        <div className="flex justify-center">
          <div className="bg-primary/10 p-6 rounded-full">
            <Wrench size={48} className="text-primary" />
          </div>
        </div>

        {/* Main Message */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Estamos trabajando en esto
          </h1>
          <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed">
            Esta página se encuentra temporalmente en construcción. Estamos trabajando para brindarte la mejor experiencia posible.
          </p>
        </div>

        {/* Status */}
        <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-center space-x-2 text-slate-600 dark:text-slate-300">
            <Clock size={20} />
            <span className="font-medium">Estado: En desarrollo</span>
          </div>
        </div>

        {/* Back to Home */}
        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center space-x-2 bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Volver al inicio</span>
          </Link>
        </div>

        {/* Contact Info */}
        <div className="pt-4 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            ¿Necesitas ayuda? Contáctanos en{' '}
            <a 
              href="mailto:hola@midimed.com" 
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              hola@midimed.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
