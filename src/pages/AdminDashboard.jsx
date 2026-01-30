/**
 * AdminDashboard.jsx - Dashboard administrativo com analytics
 */
import React, { useContext, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown,
  Eye, ArrowUpRight, Calendar
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import AdminSidebar from '@/components/admin/AdminSidebar';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AdminDashboard() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const navigate = useNavigate();

  // Verificar admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl('Home'));
    }
  }, [user, navigate]);

  // Buscar pedidos
  const { data: orders = [], isLoading: ordersLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      return await base44.entities.Order.list('-created_date', 100);
    }
  });

  // Buscar produtos
  const { data: products = [] } = useQuery({
    queryKey: ['admin', 'products'],
    queryFn: async () => {
      return await base44.entities.Product.list('-created_date', 500);
    }
  });

  // Buscar eventos de analytics
  const { data: events = [] } = useQuery({
    queryKey: ['admin', 'events'],
    queryFn: async () => {
      return await base44.entities.AnalyticsEvent.list('-created_date', 500);
    }
  });

  // Buscar usuários
  const { data: users = [] } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: async () => {
      return await base44.entities.User.list('-created_date', 200);
    }
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Calcular métricas
  const today = new Date();
  const last30Days = orders.filter(o => new Date(o.created_date) >= subDays(today, 30));
  const last7Days = orders.filter(o => new Date(o.created_date) >= subDays(today, 7));

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const revenueThisMonth = last30Days.reduce((sum, o) => sum + (o.total || 0), 0);
  const ordersThisMonth = last30Days.length;
  const averageOrderValue = ordersThisMonth > 0 ? revenueThisMonth / ordersThisMonth : 0;

  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed').length;
  const lowStockProducts = products.filter(p => p.stock <= 5 && p.stock > 0).length;
  const outOfStockProducts = products.filter(p => p.stock === 0).length;

  // Dados para gráfico de vendas por dia (últimos 7 dias)
  const salesByDay = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(today, 6 - i);
    const dayOrders = orders.filter(o => {
      const orderDate = new Date(o.created_date);
      return orderDate >= startOfDay(date) && orderDate <= endOfDay(date);
    });
    return {
      day: format(date, 'EEE', { locale: ptBR }),
      date: format(date, 'dd/MM'),
      vendas: dayOrders.reduce((sum, o) => sum + (o.total || 0), 0),
      pedidos: dayOrders.length
    };
  });

  // Status dos pedidos
  const ordersByStatus = [
    { name: 'Pendentes', value: orders.filter(o => o.status === 'pending').length, color: '#fbbf24' },
    { name: 'Confirmados', value: orders.filter(o => o.status === 'confirmed').length, color: '#3b82f6' },
    { name: 'Enviados', value: orders.filter(o => o.status === 'shipped').length, color: '#8b5cf6' },
    { name: 'Entregues', value: orders.filter(o => o.status === 'delivered').length, color: '#22c55e' },
    { name: 'Cancelados', value: orders.filter(o => o.status === 'cancelled').length, color: '#ef4444' },
  ].filter(s => s.value > 0);

  // Produtos mais vendidos
  const productSales = {};
  orders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSales[item.product_name]) {
        productSales[item.product_name] = { name: item.product_name, quantity: 0, revenue: 0 };
      }
      productSales[item.product_name].quantity += item.quantity;
      productSales[item.product_name].revenue += item.total_price || 0;
    });
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  if (!user || user.role !== 'admin') {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center",
        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
      )}>
        <p>Verificando permissões...</p>
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen flex",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
    )}>
      <AdminSidebar />

      <main className="flex-1 p-6 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className={cn(
                "text-2xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Dashboard
              </h1>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              )}>
                Visão geral do seu negócio
              </p>
            </div>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
            )}>
              {format(today, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    )}>
                      Receita (30 dias)
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {formatPrice(revenueThisMonth)}
                    </p>
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
                  )}>
                    <DollarSign className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    )}>
                      Pedidos (30 dias)
                    </p>
                    <p className="text-2xl font-bold mt-1">{ordersThisMonth}</p>
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
                  )}>
                    <ShoppingCart className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    )}>
                      Ticket Médio
                    </p>
                    <p className="text-2xl font-bold mt-1">
                      {formatPrice(averageOrderValue)}
                    </p>
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    theme === 'dark' ? 'bg-purple-500/20' : 'bg-purple-100'
                  )}>
                    <TrendingUp className="h-6 w-6 text-purple-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={cn(
                      "text-sm",
                      theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                    )}>
                      Usuários
                    </p>
                    <p className="text-2xl font-bold mt-1">{users.length}</p>
                  </div>
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
                  )}>
                    <Users className="h-6 w-6 text-amber-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Alertas */}
          {(pendingOrders > 0 || lowStockProducts > 0 || outOfStockProducts > 0) && (
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {pendingOrders > 0 && (
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'
                )}>
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="font-medium text-amber-600">{pendingOrders} pedidos pendentes</p>
                    <Link to={createPageUrl('AdminOrders')} className="text-xs text-amber-500 hover:underline">
                      Ver pedidos
                    </Link>
                  </div>
                </div>
              )}
              {lowStockProducts > 0 && (
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  theme === 'dark' ? 'bg-orange-500/10' : 'bg-orange-50'
                )}>
                  <Package className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="font-medium text-orange-600">{lowStockProducts} produtos com estoque baixo</p>
                    <Link to={createPageUrl('AdminProducts')} className="text-xs text-orange-500 hover:underline">
                      Ver produtos
                    </Link>
                  </div>
                </div>
              )}
              {outOfStockProducts > 0 && (
                <div className={cn(
                  "p-4 rounded-xl flex items-center gap-3",
                  theme === 'dark' ? 'bg-red-500/10' : 'bg-red-50'
                )}>
                  <Package className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="font-medium text-red-600">{outOfStockProducts} produtos esgotados</p>
                    <Link to={createPageUrl('AdminProducts')} className="text-xs text-red-500 hover:underline">
                      Ver produtos
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Gráficos */}
          <div className="grid lg:grid-cols-2 gap-6 mb-8">
            {/* Vendas por dia */}
            <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">Vendas (últimos 7 dias)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart data={salesByDay}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#27272a' : '#e5e5e5'} />
                    <XAxis dataKey="day" stroke={theme === 'dark' ? '#71717a' : '#a1a1aa'} />
                    <YAxis stroke={theme === 'dark' ? '#71717a' : '#a1a1aa'} tickFormatter={(v) => `R$${v/1000}k`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme === 'dark' ? '#18181b' : '#fff',
                        border: theme === 'dark' ? '1px solid #27272a' : '1px solid #e5e5e5',
                        borderRadius: '8px'
                      }}
                      formatter={(value) => [formatPrice(value), 'Vendas']}
                    />
                    <Area type="monotone" dataKey="vendas" stroke="#f59e0b" fill="url(#colorVendas)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status dos pedidos */}
            <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
              <CardHeader>
                <CardTitle className="text-lg">Status dos Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={ordersByStatus}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ordersByStatus.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {ordersByStatus.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm">{entry.name}: {entry.value}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top produtos */}
          <Card className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
            <CardHeader>
              <CardTitle className="text-lg">Produtos Mais Vendidos</CardTitle>
            </CardHeader>
            <CardContent>
              {topProducts.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.map((product, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      <span className={cn(
                        "text-lg font-bold w-6",
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                      )}>
                        {idx + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{product.name}</p>
                        <p className={cn(
                          "text-sm",
                          theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                        )}>
                          {product.quantity} vendidos
                        </p>
                      </div>
                      <p className="font-bold">{formatPrice(product.revenue)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className={cn(
                  "text-center py-8",
                  theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                )}>
                  Nenhuma venda registrada ainda
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}