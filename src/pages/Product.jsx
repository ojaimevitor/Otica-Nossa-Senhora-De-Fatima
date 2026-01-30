/**
 * Product.jsx - Página de detalhe do produto
 */
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  Heart, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight,
  Truck, Shield, RotateCcw, Share2, Check, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator
} from '@/components/ui/breadcrumb';
import ProductCarousel from '@/components/home/ProductCarousel';
import AssistantWidget from '@/components/assistant/AssistantWidget';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const categoryNames = {
  'oculos-sol': 'Óculos de Sol',
  'oculos-grau': 'Óculos de Grau',
  'lentes-contato': 'Lentes de Contato',
  'acessorios': 'Acessórios'
};

export default function Product() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const cart = context?.cart || [];
  const setCart = context?.setCart || (() => {});
  const navigate = useNavigate();

  // URL params
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  // Estados
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  // Buscar produto
  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0] || null;
    },
    enabled: !!productId
  });

  // Buscar produtos relacionados
  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['products', 'related', product?.category],
    queryFn: async () => {
      const products = await base44.entities.Product.filter(
        { category: product.category, active: true },
        '-created_date',
        12
      );
      return products.filter(p => p.id !== productId);
    },
    enabled: !!product?.category
  });

  // Verificar favorito
  useEffect(() => {
    if (user?.email && productId) {
      base44.entities.Favorite.filter({ 
        user_email: user.email, 
        product_id: productId 
      }).then(favs => {
        setIsFavorited(favs.length > 0);
      }).catch(() => {});
    }
  }, [user?.email, productId]);

  // Tracking view
  useEffect(() => {
    if (product) {
      base44.entities.AnalyticsEvent.create({
        event_name: 'view_product',
        product_id: product.id,
        product_name: product.name,
        category: product.category,
        value: product.sale_price || product.price
      }).catch(() => {});
    }
  }, [product]);

  // Calcular preços
  const originalPrice = product?.price || 0;
  const salePrice = product?.sale_price || originalPrice;
  const hasDiscount = salePrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round((1 - salePrice / originalPrice) * 100) : 0;
  const pixPrice = salePrice * 0.95;

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Handlers
  const handleAddToCart = async () => {
    if (!product || product.stock <= 0) return;
    setAddingToCart(true);

    const existingItem = cart.find(item => item.product_id === product.id);
    const currentQty = existingItem ? existingItem.quantity : 0;
    const maxAllowed = Math.min(10, product.stock);

    if (currentQty + quantity > maxAllowed) {
      toast.error(`Limite máximo: ${maxAllowed} unidades`);
      setAddingToCart(false);
      return;
    }

    if (existingItem) {
      setCart(cart.map(item =>
        item.product_id === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, {
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        brand: product.brand,
        unit_price: salePrice,
        quantity,
        max_quantity: maxAllowed
      }]);
    }

    await base44.entities.AnalyticsEvent.create({
      event_name: 'add_to_cart',
      product_id: product.id,
      product_name: product.name,
      category: product.category,
      value: salePrice * quantity
    }).catch(() => {});

    toast.success('Produto adicionado ao carrinho');
    setAddingToCart(false);
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate(createPageUrl('Cart'));
  };

  const handleFavoriteToggle = async () => {
    if (!user?.email) {
      base44.auth.redirectToLogin();
      return;
    }

    if (isFavorited) {
      const favs = await base44.entities.Favorite.filter({
        user_email: user.email,
        product_id: product.id
      });
      if (favs[0]) {
        await base44.entities.Favorite.delete(favs[0].id);
      }
      setIsFavorited(false);
      toast.success('Removido dos favoritos');
    } else {
      await base44.entities.Favorite.create({
        user_email: user.email,
        product_id: product.id,
        product_name: product.name,
        product_image: product.images?.[0] || '',
        product_price: salePrice
      });
      setIsFavorited(true);
      toast.success('Adicionado aos favoritos');
    }
  };

  const handleShare = async () => {
    try {
      await navigator.share({
        title: product.name,
        text: `Confira: ${product.name} - ${formatPrice(salePrice)}`,
        url: window.location.href
      });
    } catch {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copiado!');
    }
  };

  if (isLoading) {
    return (
      <div className={cn(
        "min-h-screen px-4 py-8",
        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
      )}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl" />
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-40" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
      )}>
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Produto não encontrado</h2>
          <Link to={createPageUrl('Home')}>
            <Button>Voltar ao início</Button>
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images?.length ? product.images : [
    'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=800'
  ];

  return (
    <div className={cn(
      "min-h-screen",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
    )}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={createPageUrl('Home')}>Início</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link to={createPageUrl('Category') + `?cat=${product.category}`}>
                  {categoryNames[product.category] || product.category}
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{product.name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Conteúdo principal */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galeria */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden",
                theme === 'dark' ? 'bg-zinc-800' : 'bg-white'
              )}
            >
              <img
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-contain"
              />
              
              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {hasDiscount && (
                  <Badge className="bg-red-500 text-white font-bold">
                    -{discountPercent}%
                  </Badge>
                )}
                {product.new_arrival && (
                  <Badge className={theme === 'dark' ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white'}>
                    Lançamento
                  </Badge>
                )}
              </div>

              {/* Navegação */}
              {images.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute left-2 top-1/2 -translate-y-1/2 rounded-full",
                      theme === 'dark' ? 'bg-zinc-700/80 hover:bg-zinc-600' : 'bg-white/80 hover:bg-white'
                    )}
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn(
                      "absolute right-2 top-1/2 -translate-y-1/2 rounded-full",
                      theme === 'dark' ? 'bg-zinc-700/80 hover:bg-zinc-600' : 'bg-white/80 hover:bg-white'
                    )}
                    onClick={() => setSelectedImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </motion.div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 justify-center">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={cn(
                      "w-16 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      selectedImage === idx
                        ? theme === 'dark' ? 'border-amber-400' : 'border-zinc-900'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    )}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-6">
            {/* Marca e nome */}
            <div>
              <p className={cn(
                "text-sm font-medium uppercase tracking-wider mb-2",
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              )}>
                {product.brand}
              </p>
              <h1 className={cn(
                "text-2xl md:text-3xl font-bold mb-2",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                {product.name}
              </h1>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
              )}>
                SKU: {product.sku || 'N/A'}
              </p>
            </div>

            {/* Preços */}
            <div className={cn(
              "p-5 rounded-xl",
              theme === 'dark' ? 'bg-zinc-800/50' : 'bg-white shadow-sm'
            )}>
              {hasDiscount && (
                <p className={cn(
                  "text-lg line-through",
                  theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                )}>
                  {formatPrice(originalPrice)}
                </p>
              )}
              <div className="flex items-baseline gap-3 mb-2">
                <p className={cn(
                  "text-3xl font-bold",
                  theme === 'dark' ? 'text-white' : 'text-zinc-900'
                )}>
                  {formatPrice(salePrice)}
                </p>
                {salePrice > 100 && (
                  <span className={cn(
                    "text-sm",
                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                  )}>
                    em até 10x de {formatPrice(salePrice / 10)}
                  </span>
                )}
              </div>
              <p className={cn(
                "text-lg font-semibold",
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              )}>
                {formatPrice(pixPrice)} <span className="text-sm font-normal">no PIX (5% off)</span>
              </p>
            </div>

            {/* Estoque */}
            {product.stock > 0 ? (
              <div className="flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                <span className={cn(
                  "font-medium",
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                )}>
                  Em estoque
                </span>
                {product.stock <= 5 && (
                  <span className={cn(
                    "text-sm",
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  )}>
                    (apenas {product.stock} disponíveis)
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                <span className="text-red-500 font-medium">Produto esgotado</span>
              </div>
            )}

            {/* Quantidade e ações */}
            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-sm",
                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                  )}>
                    Quantidade:
                  </span>
                  <div className={cn(
                    "flex items-center rounded-lg border",
                    theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                  )}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center font-medium">{quantity}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10"
                      onClick={() => setQuantity(q => Math.min(Math.min(10, product.stock), q + 1))}
                      disabled={quantity >= Math.min(10, product.stock)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <span className={cn(
                    "text-xs",
                    theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                  )}>
                    (máx. 10)
                  </span>
                </div>

                <div className="flex gap-3">
                  <Button
                    className={cn(
                      "flex-1 h-12 text-base font-semibold",
                      theme === 'dark'
                        ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400'
                        : 'bg-zinc-900 hover:bg-zinc-800'
                    )}
                    onClick={handleBuyNow}
                    disabled={addingToCart}
                  >
                    Comprar Agora
                  </Button>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 h-12 text-base font-semibold gap-2",
                      theme === 'dark' ? 'border-zinc-700' : ''
                    )}
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                  >
                    <ShoppingCart className="h-5 w-5" />
                    Adicionar
                  </Button>
                </div>
              </div>
            )}

            {/* Ações secundárias */}
            <div className="flex gap-4">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "gap-2",
                  isFavorited && (theme === 'dark' ? 'text-red-400' : 'text-red-500')
                )}
                onClick={handleFavoriteToggle}
              >
                <Heart className={cn("h-4 w-4", isFavorited && "fill-current")} />
                {isFavorited ? 'Favoritado' : 'Favoritar'}
              </Button>
              <Button variant="ghost" size="sm" className="gap-2" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
            </div>

            {/* Benefícios */}
            <div className={cn(
              "grid grid-cols-3 gap-4 p-4 rounded-xl",
              theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-100'
            )}>
              <div className="text-center">
                <Truck className={cn(
                  "h-6 w-6 mx-auto mb-2",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )} />
                <p className="text-xs font-medium">Frete grátis</p>
                <p className={cn(
                  "text-xs",
                  theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                )}>acima R$299</p>
              </div>
              <div className="text-center">
                <Shield className={cn(
                  "h-6 w-6 mx-auto mb-2",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )} />
                <p className="text-xs font-medium">Garantia</p>
                <p className={cn(
                  "text-xs",
                  theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                )}>12 meses</p>
              </div>
              <div className="text-center">
                <RotateCcw className={cn(
                  "h-6 w-6 mx-auto mb-2",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )} />
                <p className="text-xs font-medium">Troca grátis</p>
                <p className={cn(
                  "text-xs",
                  theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                )}>7 dias</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de info */}
        <div className="mt-12">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className={cn(
              "w-full justify-start h-auto p-0 bg-transparent border-b rounded-none",
              theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
            )}>
              <TabsTrigger
                value="description"
                className={cn(
                  "px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500",
                  theme === 'dark' ? 'data-[state=active]:text-amber-400' : 'data-[state=active]:text-amber-600'
                )}
              >
                Descrição
              </TabsTrigger>
              <TabsTrigger
                value="specs"
                className={cn(
                  "px-6 py-3 rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500",
                  theme === 'dark' ? 'data-[state=active]:text-amber-400' : 'data-[state=active]:text-amber-600'
                )}
              >
                Especificações
              </TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="pt-6">
              <p className={cn(
                "leading-relaxed",
                theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
              )}>
                {product.description || 'Descrição não disponível.'}
              </p>
            </TabsContent>
            <TabsContent value="specs" className="pt-6">
              <div className="grid md:grid-cols-2 gap-4">
                {product.specifications ? (
                  Object.entries(product.specifications).map(([key, value]) => (
                    <div key={key} className={cn(
                      "flex justify-between p-3 rounded-lg",
                      theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-100'
                    )}>
                      <span className={cn(
                        "text-sm",
                        theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                      )}>
                        {key.replace(/_/g, ' ')}
                      </span>
                      <span className="text-sm font-medium">{value || '-'}</span>
                    </div>
                  ))
                ) : (
                  <p className={cn(
                    "text-sm",
                    theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                  )}>
                    Especificações não disponíveis.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Produtos relacionados */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <ProductCarousel
              title="Produtos Relacionados"
              products={relatedProducts}
              favorites={[]}
              showViewAll={false}
            />
          </div>
        )}
      </div>

      <AssistantWidget />
    </div>
  );
}