'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Instagram } from 'lucide-react';

export default function FooterColumns() {
  return (
    <footer className="bg-white dark:bg-slate-900 py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: Logo + Description */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              {/* Light mode logo */}
              <Image
                src="/logoLightmode.svg"
                alt="MidiMed Logo"
                width={32}
                height={32}
                className="block dark:hidden"
              />
              {/* Dark mode logo */}
              <Image
                src="/logo.svg"
                alt="MidiMed Logo"
                width={32}
                height={32}
                className="hidden dark:block"
              />
              <span className="text-xl font-bold text-slate-900 dark:text-white">MidiMed</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
              La plataforma integral para la gestión médica que simplifica tu práctica y mejora la atención al paciente.
            </p>
          </div>

          {/* Column 2: Learn Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Aprender</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/en-construccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Funciones
              </Link>
              <Link href="/pricing" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Precios
              </Link>
              <Link href="/en-construccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Tutoriales
              </Link>
              <Link href="/en-construccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Documentación
              </Link>
            </nav>
          </div>

          {/* Column 3: About Us Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Acerca de nosotros</h3>
            <nav className="flex flex-col space-y-3">
              <Link href="/en-construccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Noticias
              </Link>
              <Link href="/en-consutrccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Preguntas frecuentes
              </Link>
              <Link href="/en-construccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Nuestra historia
              </Link>
              <Link href="/en-construccion" className="text-slate-600 dark:text-slate-300 hover:text-primary dark:hover:text-primary text-sm transition-colors">
                Únete al equipo
              </Link>
            </nav>
          </div>

          {/* Column 4: Contact + Social */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Contacto</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 text-sm">
                <Mail size={16} />
                <a href="mailto:hola@midimed.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  hola@midimed.com
                </a>
              </div>
              <div className="flex items-center space-x-2 text-slate-600 dark:text-slate-300 text-sm">
                <Phone size={16} />
                <a href="tel:+50231021287" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                  +502 3102-1287
                </a>
              </div>
            </div>
            <div className="pt-2">
              <p className="text-slate-600 dark:text-slate-300 text-sm mb-3">Síguenos</p>
              <div className="flex space-x-3">
                <a 
                  href="https://instagram.com/midimed.tech" 
                  className="text-slate-400 hover:text-primary transition-colors"
                  aria-label="Instagram"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Instagram size={20} />
                </a>
                {/* <a 
                  href="https://facebook.com/midimed" 
                  className="text-slate-400 hover:text-primary transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={20} />
                </a> */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
