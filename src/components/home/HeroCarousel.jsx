/**
 * HeroCarousel.jsx - Carrossel principal do hero
 * Sem autoplay agressivo, controle manual
 */
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { motion, AnimatePresence } from 'framer-motion';

const slides = [
  {
    id: 1,
    title: 'Volta às Aulas',
    subtitle: 'com Lentes Kodak',
    highlight: 'a partir de R$533',
    extra: '+5% OFF no PIX',
    image: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=1200&q=80',
    link: '/Category?cat=oculos-grau',
    bgColor: 'from-amber-500/20 to-orange-500/20'
  },
  {
    id: 2,
    title: 'Seleção de Verão',
    subtitle: 'Óculos de Sol',
    highlight: '30% OFF',
    extra: 'Nas melhores marcas',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=1200&q=80',
    link: '/Category?cat=oculos-sol',
    bgColor: 'from-blue-500/20 to-cyan-500/20'
  },
  {
    id: 3,
    title: 'Lentes de Contato',
    subtitle: 'Acuvue e Air Optix',
    highlight: 'Frete Grátis',
    extra: 'Acima de R$299',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=1200&q=80',
    link: '/Category?cat=lentes-contato',
    bgColor: 'from-green-500/20 to-emerald-500/20'
  }
];

export default function HeroCarousel() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const [current, setCurrent] = useState(0);

  const next = () => setCurrent((prev) => (prev + 1) % slides.length);
  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);

  const slide = slides[current];

  return (
    <div className="relative overflow-hidden">
      <div className={cn(
        "relative h-[400px] md:h-[500px] lg:h-[600px]",
        theme === 'dark' ? 'bg-zinc-900' : 'bg-zinc-100'
      )}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            {/* Background Image */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={cn(
                "absolute inset-0 bg-gradient-to-r",
                slide.bgColor,
                theme === 'dark' ? 'mix-blend-multiply' : 'mix-blend-overlay'
              )} />
              <div className={cn(
                "absolute inset-0",
                theme === 'dark' 
                  ? 'bg-gradient-to-r from-zinc-900 via-zinc-900/80 to-transparent' 
                  : 'bg-gradient-to-r from-white via-white/80 to-transparent'
              )} />
            </div>

            {/* Content */}
            <div className="relative h-full max-w-7xl mx-auto px-6 flex items-center">
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="max-w-lg"
              >
                <p className={cn(
                  "text-sm md:text-base font-medium uppercase tracking-widest mb-2",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )}>
                  {slide.subtitle}
                </p>
                <h2 className={cn(
                  "text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight",
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  {slide.title}
                </h2>
                <p className={cn(
                  "text-2xl md:text-3xl font-bold mb-2",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )}>
                  {slide.highlight}
                </p>
                <p className={cn(
                  "text-sm md:text-base mb-6",
                  theme === 'dark' ? 'text-zinc-300' : 'text-zinc-600'
                )}>
                  {slide.extra}
                </p>
                <Link to={createPageUrl(slide.link.replace('/', ''))}>
                  <Button 
                    size="lg"
                    className={cn(
                      "font-semibold px-8",
                      theme === 'dark'
                        ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400'
                        : 'bg-zinc-900 text-white hover:bg-zinc-800'
                    )}
                  >
                    Confira
                  </Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute left-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
            theme === 'dark' 
              ? 'bg-zinc-800/80 hover:bg-zinc-700 text-white' 
              : 'bg-white/80 hover:bg-white text-zinc-900'
          )}
          onClick={prev}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "absolute right-4 top-1/2 -translate-y-1/2 h-12 w-12 rounded-full",
            theme === 'dark' 
              ? 'bg-zinc-800/80 hover:bg-zinc-700 text-white' 
              : 'bg-white/80 hover:bg-white text-zinc-900'
          )}
          onClick={next}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>

        {/* Dots */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                idx === current
                  ? cn("w-8", theme === 'dark' ? 'bg-amber-400' : 'bg-zinc-900')
                  : cn("w-2", theme === 'dark' ? 'bg-zinc-600' : 'bg-zinc-400')
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}