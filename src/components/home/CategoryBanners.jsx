/**
 * CategoryBanners.jsx - Banners de categorias/promoções
 * Lentes de contato, Clip-on, etc.
 */
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function CategoryBanners() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';

  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-6">
        {/* Banner Lentes de Contato */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to={createPageUrl('Category') + '?cat=lentes-contato'}
            className={cn(
              "block relative rounded-2xl overflow-hidden h-64 group",
              theme === 'dark' ? 'bg-zinc-800' : 'bg-gradient-to-br from-blue-50 to-cyan-100'
            )}
          >
            <img
              src="https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=600&q=80"
              alt="Lentes de Contato"
              className="absolute right-0 bottom-0 h-full w-2/3 object-cover object-left transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider mb-2",
                theme === 'dark' ? 'text-cyan-400' : 'text-cyan-600'
              )}>
                Air Optix e Acuvue
              </p>
              <h3 className={cn(
                "text-2xl font-bold mb-1",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Lentes de Contato
              </h3>
              <p className={cn(
                "text-lg mb-1",
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              )}>
                a partir de
              </p>
              <p className={cn(
                "text-3xl font-bold",
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              )}>
                R$151<sup className="text-lg">,90</sup>
              </p>
              <Button className={cn(
                "mt-4 w-fit",
                theme === 'dark' ? 'bg-cyan-500 hover:bg-cyan-400 text-zinc-900' : ''
              )}>
                Aproveite
              </Button>
            </div>
          </Link>
        </motion.div>

        {/* Banner Clip-On / 2 em 1 */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
        >
          <Link
            to={createPageUrl('Category') + '?cat=acessorios'}
            className={cn(
              "block relative rounded-2xl overflow-hidden h-64 group",
              theme === 'dark' ? 'bg-zinc-800' : 'bg-gradient-to-br from-amber-50 to-orange-100'
            )}
          >
            <img
              src="https://images.unsplash.com/photo-1574258495973-f010dfbb5371?w=600&q=80"
              alt="Clip-On"
              className="absolute right-0 bottom-0 h-full w-2/3 object-cover object-left transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 p-6 flex flex-col justify-center">
              <p className={cn(
                "text-xs font-medium uppercase tracking-wider mb-2",
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              )}>
                2 em 1
              </p>
              <h3 className={cn(
                "text-2xl font-bold mb-2",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Seleção de Clip-On
              </h3>
              <p className={cn(
                "text-sm mb-4",
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              )}>
                Óculos de grau e sol em um só produto
              </p>
              <Button variant="outline" className={cn(
                "w-fit",
                theme === 'dark' ? 'border-amber-400 text-amber-400 hover:bg-amber-400/10' : ''
              )}>
                Conheça
              </Button>
            </div>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}