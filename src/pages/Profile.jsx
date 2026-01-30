/**
 * Profile.jsx - Página de perfil do usuário
 */
import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  User, Mail, Phone, MapPin, Package, Heart, Calendar, Save, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import AssistantWidget from '@/components/assistant/AssistantWidget';

export default function Profile() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;
  const setUser = context?.setUser;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: {
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: '',
      zip_code: ''
    }
  });

  // Verificar login
  useEffect(() => {
    if (!user) {
      base44.auth.redirectToLogin(window.location.href);
    } else {
      setFormData({
        full_name: user.full_name || '',
        phone: user.phone || '',
        address: user.address || {
          street: '',
          number: '',
          complement: '',
          neighborhood: '',
          city: '',
          state: '',
          zip_code: ''
        }
      });
    }
  }, [user]);

  // Salvar alterações
  const handleSave = async () => {
    setSaving(true);
    try {
      await base44.auth.updateMe(formData);
      if (setUser) {
        setUser({ ...user, ...formData });
      }
      setEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    } catch (e) {
      toast.error('Erro ao atualizar perfil');
    }
    setSaving(false);
  };

  // Buscar CEP
  const fetchAddress = async (cep) => {
    const cleanCep = cep.replace(/\D/g, '');
    if (cleanCep.length !== 8) return;

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro || '',
            neighborhood: data.bairro || '',
            city: data.localidade || '',
            state: data.uf || ''
          }
        }));
      }
    } catch (e) {}
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
      <div className="max-w-3xl mx-auto">
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold mb-8",
          theme === 'dark' ? 'text-white' : 'text-zinc-900'
        )}>
          Meu Perfil
        </h1>

        {/* Card principal */}
        <div className={cn(
          "rounded-xl overflow-hidden",
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
        )}>
          {/* Header com avatar */}
          <div className={cn(
            "p-6 flex items-center gap-4",
            theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-50'
          )}>
            <div className={cn(
              "h-20 w-20 rounded-full flex items-center justify-center text-3xl font-bold",
              theme === 'dark' ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white'
            )}>
              {(user.full_name || user.email)?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <h2 className={cn(
                "text-xl font-bold",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                {user.full_name || 'Usuário'}
              </h2>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
              )}>
                {user.email}
              </p>
            </div>
            {!editing && (
              <Button
                variant="outline"
                onClick={() => setEditing(true)}
                className={theme === 'dark' ? 'border-zinc-700' : ''}
              >
                Editar
              </Button>
            )}
          </div>

          <Separator className={theme === 'dark' ? 'bg-zinc-800' : ''} />

          {/* Formulário */}
          <div className="p-6 space-y-6">
            {/* Dados pessoais */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <User className="h-4 w-4" />
                Dados Pessoais
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.full_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className={cn(
                      "opacity-60",
                      theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''
                    )}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
              </div>
            </div>

            <Separator className={theme === 'dark' ? 'bg-zinc-800' : ''} />

            {/* Endereço */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Endereço
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="zip">CEP</Label>
                  <Input
                    id="zip"
                    placeholder="00000-000"
                    value={formData.address.zip_code}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                      setFormData(prev => ({
                        ...prev,
                        address: { ...prev.address, zip_code: value }
                      }));
                      if (value.length === 8) fetchAddress(value);
                    }}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="street">Rua / Avenida</Label>
                  <Input
                    id="street"
                    value={formData.address.street}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, street: e.target.value }
                    }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.address.number}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, number: e.target.value }
                    }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.address.complement}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, complement: e.target.value }
                    }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.address.neighborhood}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, neighborhood: e.target.value }
                    }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.address.city}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, city: e.target.value }
                    }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.address.state}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      address: { ...prev.address, state: e.target.value }
                    }))}
                    disabled={!editing}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
              </div>
            </div>

            {/* Botões */}
            {editing && (
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      full_name: user.full_name || '',
                      phone: user.phone || '',
                      address: user.address || {}
                    });
                  }}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className={cn(
                    "flex-1 gap-2",
                    theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                  )}
                >
                  {saving ? 'Salvando...' : (
                    <>
                      <Save className="h-4 w-4" />
                      Salvar
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Links rápidos */}
        <div className="grid md:grid-cols-3 gap-4 mt-6">
          <Link to={createPageUrl('Orders')}>
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}>
              <Package className={cn(
                "h-8 w-8",
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              )} />
              <div>
                <p className="font-medium">Meus Pedidos</p>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                )}>
                  Acompanhe suas compras
                </p>
              </div>
            </div>
          </Link>
          <Link to={createPageUrl('Favorites')}>
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}>
              <Heart className={cn(
                "h-8 w-8",
                theme === 'dark' ? 'text-red-400' : 'text-red-500'
              )} />
              <div>
                <p className="font-medium">Favoritos</p>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                )}>
                  Seus produtos salvos
                </p>
              </div>
            </div>
          </Link>
          <Link to={createPageUrl('Exams')}>
            <div className={cn(
              "p-4 rounded-xl flex items-center gap-3 hover:opacity-80 transition-opacity",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}>
              <Calendar className={cn(
                "h-8 w-8",
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              )} />
              <div>
                <p className="font-medium">Agendar Exame</p>
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                )}>
                  Marque sua consulta
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      <AssistantWidget />
    </div>
  );
}