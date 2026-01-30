import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function ProductCard({ product, isFavorited, onFavoriteToggle }) {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const cart = context?.cart || [];
  const setCart = context?.setCart || (() => {});
  const [localFavorited, setLocalFavorited] = useState(isFavorited);

  const originalPrice = product?.price || 0;
  const salePrice = product?.sale_price || originalPrice;
  const hasDiscount = salePrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round((1 - salePrice / originalPrice) * 100) : 0;
  const pixPrice = salePrice * 0.95;

  const formatPrice = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newState = !localFavorited;
    setLocalFavorited(newState);
    onFavoriteToggle?.(product, newState);
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!product || product.stock <= 0) return;

    const existing = cart.find(item => item.product_id === product.id);
    const maxAllowed = Math.min(10, product.stock);

    if (existing) {
      if (existing.quantity >= maxAllowed) {
        toast.error('Limite máximo atingido');
        return;
      }
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + 1 }
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
        max_quantity: maxAllowed
      }]);
    }
    toast.success('Adicionado ao carrinho');
  };

  return (
    <div className={cn(
      "group rounded-xl overflow-hidden border transition-shadow hover:shadow-lg",
      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200'
    )}>
      <Link to={`/Product?id=${product.id}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 left-2 bg-red-500 text-white">
              -{discountPercent}%
            </Badge>
          )}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "absolute top-2 right-2 h-8 w-8 rounded-full",
              localFavorited ? 'text-red-500' : '',
              theme === 'dark' ? 'bg-zinc-800/80' : 'bg-white/80'
            )}
            onClick={handleFavorite}
          >
            <Heart className={cn("h-4 w-4", localFavorited && "fill-current")} />
          </Button>
        </div>
      </Link>

      <div className="p-4">
        <p className={cn(
          "text-xs font-medium uppercase tracking-wider mb-1",
          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
        )}>
          {product.brand}
        </p>
        <Link to={`/Product?id=${product.id}`}>
          <h3 className="font-medium line-clamp-2 hover:underline">{product.name}</h3>
        </Link>
        
        <div className="mt-2">
          {hasDiscount && (
            <p className="text-sm text-zinc-500 line-through">{formatPrice(originalPrice)}</p>
          )}
          <p className="text-lg font-bold">{formatPrice(salePrice)}</p>
          <p className={cn(
            "text-sm",
            theme === 'dark' ? 'text-green-400' : 'text-green-600'
          )}>
            {formatPrice(pixPrice)} no PIX
          </p>
        </div>

        <Button
          className={cn(
            "w-full mt-3 gap-2",
            theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
          )}
          onClick={handleAddToCart}
          disabled={product.stock <= 0}
        >
          <ShoppingCart className="h-4 w-4" />
          {product.stock <= 0 ? 'Esgotado' : 'Adicionar'}
        </Button>
      </div>
    </div>
  );
}
