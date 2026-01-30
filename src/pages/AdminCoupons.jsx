/**
 * AdminCoupons.jsx - Gestão de cupons de desconto
 */
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { Plus, Tag, Edit, Trash2, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';

const emptyCoupon = {
  code: '',
  description: '',
  discount_type: 'percent',
  discount_value: 0,
  min_purchase: 0,
  max_uses: 0,
  uses_count: 0,
  valid_from: '',
  valid_until: '',
  active: true
};

export default function AdminCoupons() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState(emptyCoupon);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate(createPageUrl('Home'));
    }
  }, [user, navigate]);

  const { data: coupons = [] } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: async () => {
      return await base44.entities.Coupon.list('-created_date', 100);
    }
  });

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleCreate = () => {
    setEditingCoupon(null);
    setFormData(emptyCoupon);
    setDialogOpen(true);
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code || '',
      description: coupon.description || '',
      discount_type: coupon.discount_type || 'percent',
      discount_value: coupon.discount_value || 0,
      min_purchase: coupon.min_purchase || 0,
      max_uses: coupon.max_uses || 0,
      uses_count: coupon.uses_count || 0,
      valid_from: coupon.valid_from || '',
      valid_until: coupon.valid_until || '',
      active: coupon.active !== false
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.code || !formData.discount_value) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        code: formData.code.toUpperCase()
      };

      if (editingCoupon) {
        await base44.entities.Coupon.update(editingCoupon.id, data);
        toast.success('Cupom atualizado!');
      } else {
        await base44.entities.Coupon.create(data);
        toast.success('Cupom criado!');
      }

      queryClient.invalidateQueries(['admin', 'coupons']);
      setDialogOpen(false);
    } catch (e) {
      toast.error('Erro ao salvar cupom');
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!editingCoupon) return;
    try {
      await base44.entities.Coupon.delete(editingCoupon.id);
      toast.success('Cupom excluído!');
      queryClient.invalidateQueries(['admin', 'coupons']);
      setDeleteDialogOpen(false);
      setEditingCoupon(null);
    } catch (e) {
      toast.error('Erro ao excluir');
    }
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
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className={cn(
                "text-2xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                Cupons de Desconto
              </h1>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              )}>
                {coupons.length} cupons cadastrados
              </p>
            </div>
            <Button
              onClick={handleCreate}
              className={theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Cupom
            </Button>
          </div>

          {/* Tabela */}
          <div className={cn(
            "rounded-xl overflow-hidden",
            theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
          )}>
            <Table>
              <TableHeader>
                <TableRow className={theme === 'dark' ? 'border-zinc-800' : ''}>
                  <TableHead>Código</TableHead>
                  <TableHead>Desconto</TableHead>
                  <TableHead>Usos</TableHead>
                  <TableHead>Validade</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((coupon) => (
                  <TableRow
                    key={coupon.id}
                    className={cn(
                      "cursor-pointer",
                      theme === 'dark' ? 'border-zinc-800 hover:bg-zinc-800/50' : 'hover:bg-zinc-50'
                    )}
                    onClick={() => handleEdit(coupon)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-amber-500" />
                        <span className="font-mono font-bold">{coupon.code}</span>
                      </div>
                      {coupon.description && (
                        <p className={cn("text-xs", theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500')}>
                          {coupon.description}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {coupon.discount_type === 'percent'
                          ? `${coupon.discount_value}%`
                          : formatPrice(coupon.discount_value)}
                      </span>
                      {coupon.min_purchase > 0 && (
                        <p className={cn("text-xs", theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500')}>
                          Min: {formatPrice(coupon.min_purchase)}
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      {coupon.uses_count || 0}
                      {coupon.max_uses > 0 && ` / ${coupon.max_uses}`}
                    </TableCell>
                    <TableCell>
                      {coupon.valid_until
                        ? format(new Date(coupon.valid_until), 'dd/MM/yyyy')
                        : 'Sem limite'}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={coupon.active !== false ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}>
                        {coupon.active !== false ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
                          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(coupon); }}>
                            <Edit className="h-4 w-4 mr-2" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingCoupon(coupon);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {coupons.length === 0 && (
              <div className="text-center py-12">
                <Tag className={cn(
                  "h-12 w-12 mx-auto mb-4",
                  theme === 'dark' ? 'text-zinc-700' : 'text-zinc-300'
                )} />
                <p className={theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'}>
                  Nenhum cupom cadastrado
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Dialog de edição */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className={cn(
          "max-w-md",
          theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''
        )}>
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label>Código *</Label>
              <Input
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                placeholder="CUPOM10"
                className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
              />
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipo de Desconto</Label>
                <Select
                  value={formData.discount_type}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, discount_type: v }))}
                >
                  <SelectTrigger className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
                    <SelectItem value="percent">Porcentagem</SelectItem>
                    <SelectItem value="fixed">Valor Fixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Valor *</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.discount_value}
                  onChange={(e) => setFormData(prev => ({ ...prev, discount_value: parseFloat(e.target.value) || 0 }))}
                  className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Compra Mínima</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData(prev => ({ ...prev, min_purchase: parseFloat(e.target.value) || 0 }))}
                  className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                />
              </div>
              <div>
                <Label>Máximo de Usos</Label>
                <Input
                  type="number"
                  min="0"
                  value={formData.max_uses}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_uses: parseInt(e.target.value) || 0 }))}
                  placeholder="0 = ilimitado"
                  className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Válido a partir de</Label>
                <Input
                  type="date"
                  value={formData.valid_from}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                  className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                />
              </div>
              <div>
                <Label>Válido até</Label>
                <Input
                  type="date"
                  value={formData.valid_until}
                  onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                  className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={formData.active}
                onCheckedChange={(v) => setFormData(prev => ({ ...prev, active: v }))}
              />
              <Label>Ativo</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className={theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className={theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : ''}>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}>
            Tem certeza que deseja excluir o cupom "{editingCoupon?.code}"?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}