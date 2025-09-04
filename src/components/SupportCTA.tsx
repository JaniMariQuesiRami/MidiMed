'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageCircle, Zap } from 'lucide-react';

export default function SupportCTA() {
  return (
    <section className="w-full px-4 py-8 md:px-8 md:py-12">
  <div className="bg-primary dark:bg-[#0f2530] rounded-2xl md:rounded-2xl px-6 py-12 md:px-8 md:py-16 text-center text-white max-w-6xl mx-auto transition-colors ring-1 ring-primary/20 dark:ring-white/10">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
          ¿Tienes alguna duda o necesitas soporte?
        </h2>
        <p className="text-lg md:text-xl mb-6 opacity-90 max-w-2xl mx-auto">
          Contáctanos por teléfono o WhatsApp
        </p>
        <div className="flex items-center justify-center gap-3 mb-8 text-2xl md:text-3xl font-semibold">
          <span>+502 5537 3805</span>
        </div>
        <div className="flex flex-col md:flex-row gap-4 justify-center items-center flex-wrap">
          <Button
            asChild
            className="bg-[#25D366] hover:bg-[#1FAD52] text-white font-semibold px-6 py-3 text-base border-0"
          >
            <Link href="https://wa.me/50255373805">
              <MessageCircle size={20} className="mr-2" />
              WhatsApp
            </Link>
          </Button>
          <Button
            asChild
            className="bg-pink-500 hover:bg-pink-600 text-white font-semibold px-6 py-3 text-base border-0"
          >
            <Link href="/signup">
              <Zap size={20} className="mr-2" />
              Empezar ahora
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
