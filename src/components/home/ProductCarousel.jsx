/**
 * ProductCarousel.jsx - Carrossel de produtos
 * Usado para ofertas, lançamentos, mais vendidos
 */
import React, { useState, useRef, useContext } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import ProductCard from '../products/ProductCard';

export default function ProductCarousel({ 
  title, 
  products = [], 
  favorites = [],
  onFavoriteToggle,
  showViewAll = true,
  viewAllLink = '/Search'
}) {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScroll, 300);
    }
  };

  if (!products.length) return null;

  return (
    <section className="py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={cn(
            "text-xl md:text-2xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          )}>
            {title}
          </h2>
          <div className="flex items-center gap-2">
            {showViewAll && (
              <Button 
                variant="link" 
                className={cn(
                  "hidden md:flex",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )}
                asChild
              >
                <a href={viewAllLink}>Ver todos</a>
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full",
                theme === 'dark' ? 'border-zinc-700' : '',
                !canScrollLeft && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "h-9 w-9 rounded-full",
                theme === 'dark' ? 'border-zinc-700' : '',
                !canScrollRight && 'opacity-50 cursor-not-allowed'
              )}
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Carousel */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4 md:mx-0 md:px-0"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[260px] md:w-[280px]"
              style={{ scrollSnapAlign: 'start' }}
            >
              <ProductCard
                product={product}
                isFavorited={favorites.some(f => f.product_id === product.id)}
                onFavoriteToggle={onFavoriteToggle}
              />
            </div>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex justify-center gap-1.5 mt-4 md:hidden">
          {Array.from({ length: Math.min(5, Math.ceil(products.length / 2)) }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 w-1.5 rounded-full",
                i === 0
                  ? theme === 'dark' ? 'bg-amber-400' : 'bg-zinc-900'
                  : theme === 'dark' ? 'bg-zinc-700' : 'bg-zinc-300'
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}