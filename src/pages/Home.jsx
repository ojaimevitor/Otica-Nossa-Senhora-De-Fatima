/**
 * Home.jsx - Página inicial do e-commerce
 * Estrutura visual de loja grande com todas as seções
 */
import React, { useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';

// Componentes da Home
import HeroCarousel from '@/components/home/HeroCarousel';
import PromoBanners from '@/components/home/PromoBanners';
import ProductCarousel from '@/components/home/ProductCarousel';
import BrandsCarousel from '@/components/home/BrandsCarousel';
import HowItWorks from '@/components/home/HowItWorks';
import CategoryBanners from '@/components/home/CategoryBanners';
import AssistantWidget from '@/components/assistant/AssistantWidget';

export default function Home() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const [favorites, setFavorites] = useState([]);

  // Buscar produtos em destaque
  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: async () => {
      const products = await base44.entities.Product.filter(
        { featured: true, active: true },
        '-created_date',
        12
      );
      return products;
    }
  });

  // Buscar produtos em promoção
  const { data: saleProducts = [] } = useQuery({
    queryKey: ['products', 'sale'],
    queryFn: async () => {
      const products = await base44.entities.Product.filter(
        { active: true },
        '-discount_percent',
        12
      );
      return products.filter(p => p.discount_percent > 0);
    }
  });

  // Buscar lançamentos
  const { data: newProducts = [] } = useQuery({
    queryKey: ['products', 'new'],
    queryFn: async () => {
      const products = await base44.entities.Product.filter(
        { new_arrival: true, active: true },
        '-created_date',
        12
      );
      return products;
    }
  });

  // Buscar óculos de sol (para seção de verão)
  const { data: sunglasses = [] } = useQuery({
    queryKey: ['products', 'sunglasses'],
    queryFn: async () => {
      const products = await base44.entities.Product.filter(
        { category: 'oculos-sol', active: true },
        '-created_date',
        12
      );
      return products;
    }
  });

  // Buscar favoritos do usuário
  useEffect(() => {
    if (user?.email) {
      base44.entities.Favorite.filter({ user_email: user.email })
        .then(setFavorites)
        .catch(() => {});
    }
  }, [user?.email]);

  // Toggle favorito
  const handleFavoriteToggle = async (product, isFavorited) => {
    if (!user?.email) {
      base44.auth.redirectToLogin();
      return;
    }

    if (isFavorited) {
      // Adicionar
      const newFav = await base44.entities.Favorite.create({
        user_email: user.email,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        product_price: product.sale_price || product.price
      });
      setFavorites([...favorites, newFav]);
    } else {
      // Remover
      const fav = favorites.find(f => f.product_id === product.id);
      if (fav) {
        await base44.entities.Favorite.delete(fav.id);
        setFavorites(favorites.filter(f => f.id !== fav.id));
      }
    }
  };

  return (
    <div className={cn(
      "min-h-screen",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-white'
    )}>
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Banners Promocionais */}
      <PromoBanners />

      {/* Ofertas */}
      {saleProducts.length > 0 && (
        <ProductCarousel
          title="Ofertas - Os Menores Preços"
          products={saleProducts}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          viewAllLink="/Search?promo=true"
        />
      )}

      {/* Marcas */}
      <BrandsCarousel />

      {/* Seleção de Verão - Óculos de Sol */}
      {sunglasses.length > 0 && (
        <ProductCarousel
          title="Seleção de Verão com 30% OFF"
          products={sunglasses}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          viewAllLink="/Category?cat=oculos-sol"
        />
      )}

      {/* Banners de Categoria */}
      <CategoryBanners />

      {/* Passo a Passo */}
      <HowItWorks />

      {/* Lançamentos */}
      {newProducts.length > 0 && (
        <ProductCarousel
          title="Novidades"
          products={newProducts}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          viewAllLink="/Search?new=true"
        />
      )}

      {/* Destaques */}
      {featuredProducts.length > 0 && (
        <ProductCarousel
          title="Destaques"
          products={featuredProducts}
          favorites={favorites}
          onFavoriteToggle={handleFavoriteToggle}
          viewAllLink="/Search"
        />
      )}

      {/* Assistente Virtual */}
      <AssistantWidget />
    </div>
  );
}