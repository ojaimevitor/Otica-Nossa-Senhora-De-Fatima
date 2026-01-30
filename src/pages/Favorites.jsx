/**
 * Favorites.jsx - Página de favoritos do usuário
 */
import React, { useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AssistantWidget from '@/components/assistant/AssistantWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function Favorites() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const cart = context?.cart || [];
  const setCart = context?.setCart || (() => {});
  const queryClient = useQueryClient();

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Verificar login
  useEffect(() => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
    }
  }, [user]);

  // Buscar favoritos
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorites', user?.email],
    queryFn: async () => {
      if (!user?.email) return [];
      return await base44.entities.Favorite.filter(
        { user_email: user.email },
        '-created_date'
      );
    },
    enabled: !!user?.email
  });

  // Buscar dados atualizados dos produtos
  const { data: productsMap = {} } = useQuery({
    queryKey: ['products', 'favorites', favorites.map(f => f.product_id)],
    queryFn: async () => {
      if (favorites.length === 0) return {};
      const products = await base44.entities.Product.filter({ active: true });
      const map = {};
      products.forEach(p => { map[p.id] = p; });
      return map;
    },
    enabled: favorites.length > 0
  });

  // Remover favorito
  const removeFavorite = async (favId) => {
    await base44.entities.Favorite.delete(favId);
    queryClient.invalidateQueries(['favorites']);
    toast.success('Removido dos favoritos');
  };

  // Adicionar ao carrinho
  const addToCart = (product) => {
    if (!product || product.stock <= 0) return;

    const existingItem = cart.find(item => item.product_id === product.id);
    const salePrice = product.sale_price || product.price;

    if (existingItem) {
      if (existingItem.quantity >= 10) {
        toast.error('Limite máximo: 10 unidades');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: Math.min(item.quantity + 1, 10, product.stock) }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        brand: product.brand,
        unit_price: salePrice,
        quantity: 1,
        max_quantity: Math.min(10, product.stock)
      }]);
    }

    toast.success('Adicionado ao carrinho');
  };

  if (!user) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
      )}>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen py-8 px-4",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
    )}>
      <div className="max-w-6xl mx-auto">
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold mb-8",
          theme === 'dark' ? 'text-white' : 'text-zinc-900'
        )}>
          Meus Favoritos
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : favorites.length === 0 ? (
          <div className={cn(
            "text-center py-16 rounded-xl",
            theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
          )}>
            <Heart className={cn(
              "h-16 w-16 mx-auto mb-4",
              theme === 'dark' ? 'text-zinc-700' : 'text-zinc-300'
            )} />
            <h2 className={cn(
              "text-xl font-semibold mb-2",
              theme === 'dark' ? 'text-white' : 'text-zinc-900'
            )}>
              Nenhum favorito ainda
            </h2>
            <p className={cn(
              "text-sm mb-6",
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Salve seus produtos favoritos para encontrá-los facilmente
            </p>
            <Link to={createPageUrl('Home')}>
              <Button className={theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''}>
                Explorar Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {favorites.map((fav) => {
                const product = productsMap[fav.product_id];
                const isAvailable = product && product.stock > 0;

                return (
                  <motion.div
                    key={fav.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={cn(
                      "rounded-xl overflow-hidden",
                      theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
                    )}
                  >
                    <Link
                      to={createPageUrl('Product') + `?id=${fav.product_id}`}
                      className="block relative aspect-square"
                    >
                      <img
                        src={fav.product_image || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300'}
                        alt={fav.product_name}
                        className="w-full h-full object-cover"
                      />
                      {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">Indisponível</span>
                        </div>
                      )}
                    </Link>

                    <div className="p-4">
                      <Link to={createPageUrl('Product') + `?id=${fav.product_id}`}>
                        <h3 className={cn(
                          "font-medium line-clamp-2 mb-2 hover:underline",
                          theme === 'dark' ? 'text-white' : 'text-zinc-900'
                        )}>
                          {fav.product_name}
                        </h3>
                      </Link>

                      <p className={cn(
                        "text-lg font-bold mb-4",
                        theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      )}>
                        {formatPrice(product?.sale_price || product?.price || fav.product_price)}
                      </p>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950"
                          onClick={() => removeFavorite(fav.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <Button
                          className={cn(
                            "flex-1 gap-2",
                            theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                          )}
                          onClick={() => addToCart(product)}
                          disabled={!isAvailable}
                        >
                          <ShoppingCart className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AssistantWidget />
    </div>
  );
}