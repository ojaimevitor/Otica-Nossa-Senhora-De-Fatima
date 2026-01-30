/**
 * Checkout.jsx - Página de finalização de compra
 * Reduz estoque ao confirmar, cria pedido no banco
 */
import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  CreditCard, QrCode, FileText, ChevronLeft, Check, Lock,
  Truck, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function Checkout() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const setCart = context?.setCart || (() => {});
  const navigate = useNavigate();

  const [checkoutData, setCheckoutData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);

  const [address, setAddress] = useState({
    zip_code: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Carregar dados do checkout
  useEffect(() => {
    const data = localStorage.getItem('checkout_data');
    if (data) {
      setCheckoutData(JSON.parse(data));
    } else {
      navigate(createPageUrl('Cart'));
    }
  }, [navigate]);

  // Verificar login
  useEffect(() => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
    }
  }, [user]);

  // Buscar CEP
  const fetchAddress = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        }));
      }
    } catch (e) {
      // Silently fail
    }
  };

  // Processar pedido
  const processOrder = async () => {
    if (!user || !checkoutData) return;
    
    setProcessing(true);

    try {
      // Calcular total final baseado no método de pagamento
      const finalTotal = paymentMethod === 'pix' ? checkoutData.pixTotal : checkoutData.total;

      // Criar pedido
      const order = await base44.entities.Order.create({
        user_email: user.email,
        user_name: user.full_name || 'Cliente',
        status: 'pending',
        items: checkoutData.items.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          product_image: item.product_image,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total_price: item.unit_price * item.quantity
        })),
        subtotal: checkoutData.subtotal,
        discount_amount: checkoutData.discount || 0,
        coupon_code: checkoutData.coupon?.code || null,
        shipping_cost: checkoutData.shipping,
        total: finalTotal,
        payment_method: paymentMethod,
        shipping_address: address
      });

      // Atualizar estoque dos produtos
      for (const item of checkoutData.items) {
        const products = await base44.entities.Product.filter({ id: item.product_id });
        if (products[0]) {
          const newStock = Math.max(0, products[0].stock - item.quantity);
          await base44.entities.Product.update(item.product_id, { stock: newStock });
        }
      }

      // Atualizar uso do cupom
      if (checkoutData.coupon) {
        await base44.entities.Coupon.update(checkoutData.coupon.id, {
          uses_count: (checkoutData.coupon.uses_count || 0) + 1
        });
      }

      // Tracking
      await base44.entities.AnalyticsEvent.create({
        event_name: 'purchase',
        user_email: user.email,
        value: finalTotal,
        metadata: {
          order_id: order.id,
          payment_method: paymentMethod,
          items_count: checkoutData.items.length
        }
      });

      // Limpar carrinho
      setCart([]);
      localStorage.removeItem('checkout_data');
      localStorage.removeItem('cart');

      // Redirecionar para confirmação
      toast.success('Pedido realizado com sucesso!');
      navigate(createPageUrl('Orders') + `?new=${order.id}`);

    } catch (e) {
      console.error(e);
      toast.error('Erro ao processar pedido. Tente novamente.');
    }

    setProcessing(false);
  };

  if (!checkoutData || !user) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
      )}>
        <div className="animate-pulse text-center">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen py-8 px-4",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
    )}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to={createPageUrl('Cart')}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className={cn(
            "text-2xl font-bold",
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          )}>
            Finalizar Compra
          </h1>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
                  step >= s
                    ? theme === 'dark' ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white'
                    : theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-500'
                )}>
                  {step > s ? <Check className="h-4 w-4" /> : s}
                </div>
                <span className={cn(
                  "hidden sm:block text-sm",
                  step >= s
                    ? theme === 'dark' ? 'text-white' : 'text-zinc-900'
                    : theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                )}>
                  {s === 1 ? 'Entrega' : s === 2 ? 'Pagamento' : 'Confirmação'}
                </span>
              </div>
              {s < 3 && (
                <div className={cn(
                  "w-12 h-0.5",
                  step > s
                    ? theme === 'dark' ? 'bg-amber-500' : 'bg-zinc-900'
                    : theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'
                )} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulário */}
          <div className="lg:col-span-2">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className={cn(
                "rounded-xl p-6",
                theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
              )}
            >
              {/* Step 1: Endereço */}
              {step === 1 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <MapPin className={cn(
                      "h-5 w-5",
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    )} />
                    <h2 className="text-lg font-semibold">Endereço de Entrega</h2>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="zip">CEP</Label>
                      <Input
                        id="zip"
                        placeholder="00000-000"
                        value={address.zip_code}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                          setAddress(prev => ({ ...prev, zip_code: value }));
                          if (value.length === 8) fetchAddress(value);
                        }}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="street">Rua / Avenida</Label>
                      <Input
                        id="street"
                        value={address.street}
                        onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número</Label>
                      <Input
                        id="number"
                        value={address.number}
                        onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        placeholder="Apto, Bloco..."
                        value={address.complement}
                        onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro</Label>
                      <Input
                        id="neighborhood"
                        value={address.neighborhood}
                        onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade</Label>
                      <Input
                        id="city"
                        value={address.city}
                        onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        value={address.state}
                        onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                        className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                      />
                    </div>
                  </div>

                  <Button
                    className={cn(
                      "w-full mt-4",
                      theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                    )}
                    onClick={() => setStep(2)}
                    disabled={!address.zip_code || !address.street || !address.number || !address.city}
                  >
                    Continuar para Pagamento
                  </Button>
                </div>
              )}

              {/* Step 2: Pagamento */}
              {step === 2 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <CreditCard className={cn(
                      "h-5 w-5",
                      theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                    )} />
                    <h2 className="text-lg font-semibold">Forma de Pagamento</h2>
                  </div>

                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer",
                      paymentMethod === 'pix'
                        ? theme === 'dark' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-900 bg-zinc-50'
                        : theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                    )}>
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex-1 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <QrCode className="h-5 w-5" />
                            <div>
                              <p className="font-medium">PIX</p>
                              <p className={cn(
                                "text-xs",
                                theme === 'dark' ? 'text-green-400' : 'text-green-600'
                              )}>
                                5% de desconto - {formatPrice(checkoutData.pixTotal)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer",
                      paymentMethod === 'credit_card'
                        ? theme === 'dark' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-900 bg-zinc-50'
                        : theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                    )}>
                      <RadioGroupItem value="credit_card" id="credit_card" />
                      <Label htmlFor="credit_card" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Cartão de Crédito</p>
                            <p className={cn(
                              "text-xs",
                              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                            )}>
                              Em até 10x sem juros
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>

                    <div className={cn(
                      "flex items-center gap-4 p-4 rounded-lg border cursor-pointer",
                      paymentMethod === 'boleto'
                        ? theme === 'dark' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-900 bg-zinc-50'
                        : theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                    )}>
                      <RadioGroupItem value="boleto" id="boleto" />
                      <Label htmlFor="boleto" className="flex-1 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5" />
                          <div>
                            <p className="font-medium">Boleto Bancário</p>
                            <p className={cn(
                              "text-xs",
                              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                            )}>
                              Prazo de 3 dias úteis
                            </p>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="flex gap-3 mt-4">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      className={cn(
                        "flex-1",
                        theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                      )}
                      onClick={() => setStep(3)}
                    >
                      Revisar Pedido
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Confirmação */}
              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-lg font-semibold">Revisar e Confirmar</h2>

                  {/* Endereço */}
                  <div className={cn(
                    "p-4 rounded-lg",
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium text-sm">Entregar em</span>
                    </div>
                    <p className="text-sm">
                      {address.street}, {address.number}
                      {address.complement && ` - ${address.complement}`}
                    </p>
                    <p className="text-sm">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                    <p className="text-sm">{address.zip_code}</p>
                  </div>

                  {/* Pagamento */}
                  <div className={cn(
                    "p-4 rounded-lg",
                    theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-medium text-sm">Pagamento</span>
                    </div>
                    <p className="text-sm">
                      {paymentMethod === 'pix' && 'PIX - 5% de desconto'}
                      {paymentMethod === 'credit_card' && 'Cartão de Crédito - até 10x'}
                      {paymentMethod === 'boleto' && 'Boleto Bancário'}
                    </p>
                  </div>

                  {/* Itens */}
                  <div>
                    <p className="font-medium text-sm mb-3">{checkoutData.items.length} itens</p>
                    <div className="space-y-2">
                      {checkoutData.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3 text-sm">
                          <img
                            src={item.product_image || 'https://via.placeholder.com/40'}
                            alt=""
                            className="w-10 h-10 rounded object-cover"
                          />
                          <span className="flex-1 truncate">{item.product_name}</span>
                          <span>x{item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.unit_price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                      Voltar
                    </Button>
                    <Button
                      className={cn(
                        "flex-1 gap-2",
                        theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                      )}
                      onClick={processOrder}
                      disabled={processing}
                    >
                      <Lock className="h-4 w-4" />
                      {processing ? 'Processando...' : 'Confirmar Pedido'}
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Resumo lateral */}
          <div className="lg:col-span-1">
            <div className={cn(
              "sticky top-28 rounded-xl p-6",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}>
              <h3 className="font-semibold mb-4">Resumo</h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
                    Subtotal
                  </span>
                  <span>{formatPrice(checkoutData.subtotal)}</span>
                </div>
                {checkoutData.discount > 0 && (
                  <div className="flex justify-between text-green-500">
                    <span>Desconto</span>
                    <span>-{formatPrice(checkoutData.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
                    Frete
                  </span>
                  <span className={checkoutData.shipping === 0 ? 'text-green-500' : ''}>
                    {checkoutData.shipping === 0 ? 'Grátis' : formatPrice(checkoutData.shipping)}
                  </span>
                </div>
              </div>

              <Separator className={cn("my-4", theme === 'dark' ? 'bg-zinc-800' : '')} />

              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>
                  {formatPrice(paymentMethod === 'pix' ? checkoutData.pixTotal : checkoutData.total)}
                </span>
              </div>
              {paymentMethod === 'pix' && (
                <p className={cn(
                  "text-xs text-green-500 text-right",
                )}>
                  5% off no PIX
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}