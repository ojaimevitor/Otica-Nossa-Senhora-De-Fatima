/**
 * AdminSidebar.jsx - Sidebar do painel administrativo
 */
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Tag, Settings,
  BarChart3, Calendar, ChevronLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', page: 'AdminDashboard' },
  { icon: Package, label: 'Produtos', page: 'AdminProducts' },
  { icon: ShoppingCart, label: 'Pedidos', page: 'AdminOrders' },
  { icon: Users, label: 'Usuários', page: 'AdminUsers' },
  { icon: Tag, label: 'Cupons', page: 'AdminCoupons' },
  { icon: Calendar, label: 'Agendamentos', page: 'AdminAppointments' },
];

export default function AdminSidebar({ collapsed = false }) {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <aside className={cn(
      "flex flex-col h-full",
      collapsed ? "w-16" : "w-64",
      theme === 'dark' ? 'bg-zinc-900 border-zinc-800' : 'bg-white border-zinc-200',
      "border-r transition-all duration-300"
    )}>
      {/* Header */}
      <div className={cn(
        "p-4 border-b",
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      )}>
        <Link to={createPageUrl('Home')} className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="flex-shrink-0">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {!collapsed && (
            <span className="font-bold text-lg">Admin</span>
          )}
        </Link>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-3 space-y-1">
        {menuItems.map((item) => {
          const isActive = currentPath.includes(item.page);
          return (
            <Link
              key={item.page}
              to={createPageUrl(item.page)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors",
                isActive
                  ? theme === 'dark'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-zinc-100 text-zinc-900'
                  : theme === 'dark'
                    ? 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn(
        "p-4 border-t",
        theme === 'dark' ? 'border-zinc-800' : 'border-zinc-200'
      )}>
        {!collapsed && (
          <p className={cn(
            "text-xs",
            theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'
          )}>
            Painel Administrativo
          </p>
        )}
      </div>
    </aside>
  );
}