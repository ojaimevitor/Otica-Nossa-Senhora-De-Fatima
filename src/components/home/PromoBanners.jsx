/**
 * PromoBanners.jsx - Banners promocionais menores
 * Grid de ofertas destacadas
 */
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { motion } from 'framer-motion';

const banners = [
  {
    id: 1,
    title: 'ATÉ R$150',
    subtitle: 'de desconto na primeira compra',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80',
    link: '/Search?promo=true',
    accent: 'amber'
  },
  {
    id: 2,
    title: 'ATÉ R$150',
    subtitle: 'armação + lente',
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80',
    link: '/Category?cat=oculos-grau',
    accent: 'blue'
  },
  {
    id: 3,
    title: 'FRETE GRÁTIS',
    subtitle: 'acima de R$299',
    image: 'https://images.unsplash.com/photo-1577803645773-f96470509666?w=400&q=80',
    link: '/Category?cat=oculos-sol',
    accent: 'green'
  },
  {
    id: 4,
    title: 'DESTAQUE',
    subtitle: 'Novidades em lentes',
    image: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?w=400&q=80',
    link: '/Category?cat=lentes-contato',
    accent: 'purple'
  }
];

export default function PromoBanners() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';

  const accentColors = {
    amber: theme === 'dark' ? 'from-amber-600/30' : 'from-amber-500/20',
    blue: theme === 'dark' ? 'from-blue-600/30' : 'from-blue-500/20',
    green: theme === 'dark' ? 'from-green-600/30' : 'from-green-500/20',
    purple: theme === 'dark' ? 'from-purple-600/30' : 'from-purple-500/20',
  };

  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {banners.map((banner, idx) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <Link
                to={createPageUrl(banner.link.replace('/', ''))}
                className={cn(
                  "block relative h-48 md:h-56 rounded-2xl overflow-hidden group",
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                )}
              >
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={cn(
                  "absolute inset-0 bg-gradient-to-t to-transparent",
                  accentColors[banner.accent],
                  theme === 'dark' ? 'from-zinc-900/90' : 'from-black/70'
                )} />
                <div className="absolute inset-0 flex flex-col justify-end p-4">
                  <p className={cn(
                    "text-xs font-medium uppercase tracking-wide",
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-300'
                  )}>
                    {banner.subtitle}
                  </p>
                  <h3 className="text-white text-lg md:text-xl font-bold">
                    {banner.title}
                  </h3>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}