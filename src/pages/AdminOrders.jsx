/**
 * AdminOrders.jsx - Gestão de pedidos
 */
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  Search, Package, Truck, CheckCircle, XCircle, Clock, Eye, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const statusConfig = {
  pending: { label: 'Pendente', icon: Clock, color: 'bg-yellow-100 text-yellow-700' },
  confirmed: { label: 'Confirmado', icon: CheckCircle, color: 'bg-blue-100 text-blue-700' },
  processing: { label: 'Preparando', icon: Package, color: 'bg-purple-100 text-purple-700' },
  shipped: { label: 'Enviado', icon: Truck, color: 'bg-indigo-100 text-indigo-700' },
  delivered: { label: 'Entregue', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  cancelled: { label: 'Cancelado', icon: XCircle, color: 'bg-red-100 text-red-700' }
};

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'confirmed', label: 'Confirmado' },
  { value: 'processing', label: 'Preparando' },
  { value: 'shipped', label: 'Enviado' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' }
];

export default function AdminOrders() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [trackingCode, setTrackingCode] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Verificar admin
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl('Home'));
    }
  }, [user, navigate]);

  // Buscar pedidos
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin', 'orders'],
    queryFn: async () => {
      return await base44.entities.Order.list('-created_date', 200);
    }
  });

  // Filtrar pedidos
  const filteredOrders = orders.filter(o => {
    const matchSearch = !search ||
      o.id?.toLowerCase().includes(search.toLowerCase()) ||
      o.user_email?.toLowerCase().includes(search.toLowerCase()) ||
      o.user_name?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Atualizar status
  const updateStatus = async (order, newStatus) => {
    setUpdatingStatus(true);
    try {
      const updateData = { status: newStatus };
      if (newStatus === 'shipped' && trackingCode) {
        updateData.tracking_code = trackingCode;
      }
      await base44.entities.Order.update(order.id, updateData);
      toast.success(`Status atualizado para "${statusConfig[newStatus].label}"`);
      queryClient.invalidateQueries(['admin', 'orders']);
      setDetailsOpen(false);
    } catch (e) {
      toast.error('Erro ao atualizar status');
    }
    setUpdatingStatus(false);
  };

  // Abrir detalhes
  const openDetails = (order) => {
    setSelectedOrder(order);
    setTrackingCode(order.tracking_code || '');
    setDetailsOpen(true);
  };

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
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h1 className={cn(
                "text-2xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Pedidos
              </h1>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              )}>
                {orders.length} pedidos no total
              </p>
            </div>
          </div>

          {/* Filtros */}
          <div className={cn(
            "flex flex-wrap gap-4 p-4 rounded-xl mb-6",
            theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
          )}>
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                  theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                )} />
                <Input
                  placeholder="Buscar por ID, cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={cn(
                    "pl-10",
                    theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''
                  )}
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className={cn(
                "w-48",
                theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''
              )}>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
                <SelectItem value="all">Todos os status</SelectItem>
                {statusOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tabela */}
          <div className={cn(
            "rounded-xl overflow-hidden",
            theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
          )}>
            <Table>
              <TableHeader>
                <TableRow className={theme === 'dark' ? 'border-zinc-800' : ''}>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.pending;
                  return (
                    <TableRow
                      key={order.id}
                      className={cn(
                        "cursor-pointer",
                        theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800/50' : 'hover:bg-zinc-50'
                      )}
                      onClick={() => openDetails(order)}
                    >
                      <TableCell>
                        <p className="font-mono font-medium">#{order.id?.slice(-8).toUpperCase()}</p>
                        <p className={cn(
                          "text-xs",
                          theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                        )}>
                          {order.items?.length || 0} itens
                        </p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{order.user_name || 'Cliente'}</p>
                        <p className={cn(
                          "text-sm",
                          theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                        )}>
                          {order.user_email}
                        </p>
                      </TableCell>
                      <TableCell>
                        {format(new Date(order.created_date), "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openDetails(order); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <Package className={cn(
                  "h-12 w-12 mx-auto mb-4",
                  theme === 'dark' ? 'text-zinc-700' : 'text-zinc-300'
                )} />
                <p className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}>
                  Nenhum pedido encontrado
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Modal de detalhes */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className={cn(
          "max-w-2xl max-h-[90vh] overflow-y-auto",
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''
        )}>
          <DialogHeader>
            <DialogTitle>
              Pedido #{selectedOrder?.id?.slice(-8).toUpperCase()}
            </DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Status atual */}
              <div className="flex items-center justify-between">
                <div>
                  <p className={cn("text-sm", theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600')}>
                    Status atual
                  </p>
                  <Badge className={statusConfig[selectedOrder.status]?.color || ''}>
                    {statusConfig[selectedOrder.status]?.label || 'Desconhecido'}
                  </Badge>
                </div>
                <div className="text-right">
                  <p className={cn("text-sm", theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600')}>
                    Data do pedido
                  </p>
                  <p className="font-medium">
                    {format(new Date(selectedOrder.created_date), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                </div>
              </div>

              {/* Cliente */}
              <div className={cn(
                "p-4 rounded-lg",
                theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
              )}>
                <p className="font-medium mb-2">Cliente</p>
                <p>{selectedOrder.user_name}</p>
                <p className={cn("text-sm", theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600')}>
                  {selectedOrder.user_email}
                </p>
              </div>

              {/* Endereço */}
              {selectedOrder.shipping_address && (
                <div className={cn(
                  "p-4 rounded-lg",
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
                )}>
                  <p className="font-medium mb-2">Endereço de entrega</p>
                  <p className="text-sm">
                    {selectedOrder.shipping_address.street}, {selectedOrder.shipping_address.number}
                    {selectedOrder.shipping_address.complement && ` - ${selectedOrder.shipping_address.complement}`}
                  </p>
                  <p className="text-sm">
                    {selectedOrder.shipping_address.neighborhood}, {selectedOrder.shipping_address.city} - {selectedOrder.shipping_address.state}
                  </p>
                  <p className="text-sm">{selectedOrder.shipping_address.zip_code}</p>
                </div>
              )}

              {/* Itens */}
              <div>
                <p className="font-medium mb-3">Itens do pedido</p>
                <div className="space-y-2">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className={cn(
                        "w-12 h-12 rounded-lg overflow-hidden",
                        theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                      )}>
                        <img
                          src={item.product_image || 'https://via.placeholder.com/48'}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.product_name}</p>
                        <p className={cn("text-sm", theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500')}>
                          x{item.quantity}
                        </p>
                      </div>
                      <p className="font-medium">{formatPrice(item.total_price)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totais */}
              <div className={cn(
                "p-4 rounded-lg space-y-2",
                theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
              )}>
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(selectedOrder.subtotal)}</span>
                </div>
                {selectedOrder.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-500">
                    <span>Desconto {selectedOrder.coupon_code && `(${selectedOrder.coupon_code})`}</span>
                    <span>-{formatPrice(selectedOrder.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Frete</span>
                  <span>{selectedOrder.shipping_cost === 0 ? 'Grátis' : formatPrice(selectedOrder.shipping_cost)}</span>
                </div>
                <div className="flex justify-between font-bold pt-2 border-t border-zinc-200 dark:border-zinc-700">
                  <span>Total</span>
                  <span>{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* Código de rastreamento */}
              {(selectedOrder.status === 'processing' || selectedOrder.status === 'shipped') && (
                <div>
                  <p className="font-medium mb-2">Código de Rastreamento</p>
                  <Input
                    value={trackingCode}
                    onChange={(e) => setTrackingCode(e.target.value)}
                    placeholder="Digite o código de rastreamento"
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
              )}

              {/* Atualizar status */}
              <div>
                <p className="font-medium mb-2">Atualizar Status</p>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((s) => (
                    <Button
                      key={s.value}
                      variant={selectedOrder.status === s.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStatus(selectedOrder, s.value)}
                      disabled={updatingStatus || selectedOrder.status === s.value}
                      className={selectedOrder.status === s.value && (theme === 'dark' ? 'bg-amber-500 text-zinc-900' : '')}
                    >
                      {s.label}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}