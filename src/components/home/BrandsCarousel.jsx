/**
 * BrandsCarousel.jsx - Carrossel de logos de marcas
 */
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';

const brands = [
  { name: 'Ray-Ban', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Ray-Ban_logo.svg/1200px-Ray-Ban_logo.svg.png' },
  { name: 'Oakley', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a1/Oakley_logo.svg/1200px-Oakley_logo.svg.png' },
  { name: 'Arnette', logo: 'https://www.arnette.com/on/demandware.static/Sites-arnette-Site/-/default/dw78dd4f31/images/Arnette_logo.svg' },
  { name: 'Vogue', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/aa/Vogue_Australia.svg/1200px-Vogue_Australia.svg.png' },
  { name: 'Tecnol', logo: null },
  { name: 'Burberry', logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Burberry_Logo.svg/1200px-Burberry_Logo.svg.png' },
];

export default function BrandsCarousel() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';

  return (
    <section className={cn(
      "py-8 px-4 md:px-6 border-y",
      theme === 'dark' ? 'border-zinc-800 bg-zinc-900/50' : 'border-zinc-200 bg-zinc-50/50'
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-8 md:gap-16 overflow-x-auto scrollbar-hide py-4">
          {brands.map((brand) => (
            <Link
              key={brand.name}
              to={createPageUrl('Search') + `?q=${brand.name}`}
              className={cn(
                "flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity",
                theme === 'dark' ? 'grayscale hover:grayscale-0 invert' : 'grayscale hover:grayscale-0'
              )}
            >
              {brand.logo ? (
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className="h-6 md:h-8 object-contain"
                />
              ) : (
                <span className={cn(
                  "text-lg md:text-xl font-bold tracking-wider",
                  theme === 'dark' ? 'text-white' : 'text-zinc-800'
                )}>
                  {brand.name}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}