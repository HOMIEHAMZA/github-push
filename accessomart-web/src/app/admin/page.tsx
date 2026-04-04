'use client';

import React, { useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  Package,
  AlertCircle,
  Loader2
} from 'lucide-react';

export default function AdminOverview() {
  const { stats, orders, isLoading, error, fetchDashboard } = useAdminStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const statCards = [
    { 
      label: 'Total Revenue', 
      value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '$0', 
      change: '+14.2%', 
      icon: DollarSign, 
      color: 'text-emerald-500' 
    },
    { 
      label: 'Total Orders', 
      value: stats?.totalOrders || 0, 
      change: '+12.5%', 
      icon: ShoppingBag, 
      color: 'text-primary' 
    },
    { 
      label: 'Total Customers', 
      value: stats?.totalUsers || 0, 
      change: '+4.3%', 
      icon: Users, 
      color: 'text-tertiary' 
    },
    { 
      label: 'Active Inventory', 
      value: stats?.totalProducts || 0, 
      change: 'Synced', 
      icon: Package, 
      color: 'text-zinc-400' 
    },
  ];

  if (isLoading && !stats) {
    return (
      <AdminLayout activeItem="Overview">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <Loader2 className="w-10 h-10 text-primary animate-spin" />
          <p className="text-zinc-500 font-medium animate-pulse uppercase tracking-widest text-[10px]">
            Syncing with mainframe...
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activeItem="Overview">
      {error && (
        <div className="mb-8 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-500 text-sm">
          <AlertCircle size={18} />
          <p>{error}</p>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, i) => (
          <div 
            key={i}
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-300"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={stat.color}>
                <stat.icon size={24} strokeWidth={1.5} />
              </div>
              <span className="text-[10px] font-bold text-zinc-500 bg-white/5 px-2 py-1 rounded-full flex items-center">
                {stat.change} <ArrowUpRight size={10} className="ml-1" />
              </span>
            </div>
            <h3 className="text-zinc-500 text-xs font-semibold tracking-wider uppercase mb-1">{stat.label}</h3>
            <p className="text-2xl font-display font-bold text-white">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="xl:col-span-2 p-8 rounded-3xl bg-white/5 border border-white/10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-lg font-bold text-white tracking-tight uppercase">SYSTEM PULSE</h2>
            <button className="text-[10px] font-bold text-primary hover:text-white transition-colors tracking-widest uppercase">VIEW ALL</button>
          </div>
          
          <div className="space-y-6">
            {orders.length > 0 ? orders.map((order, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-primary transition-colors">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">
                      {order.user?.firstName} {order.user?.lastName}
                    </h4>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                      {order.orderNumber} • {order._count?.items || 0} Items
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-display font-bold text-white">${order.total.toFixed(2)}</p>
                  <p className={`text-[10px] uppercase font-bold tracking-widest ${
                    order.status === 'DELIVERED' ? 'text-emerald-400' : 
                    order.status === 'PENDING' ? 'text-yellow-400' : 'text-primary'
                  }`}>
                    {order.status}
                  </p>
                </div>
              </div>
            )) : (
              <div className="py-12 text-center">
                <p className="text-zinc-500 text-sm italic">No recent activity detected.</p>
              </div>
            )}
          </div>
        </div>

        {/* System Health */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6 tracking-tight uppercase">STATUS CORES</h2>
            <div className="space-y-6">
              {[
                { label: 'Edge Latency', value: '18ms', score: 98 },
                { label: 'Cloudinary Sync', value: 'Optimal', score: 100 },
                { label: 'Stripe Callback', value: 'Listening', score: 100 }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-2 uppercase tracking-[0.2em]">
                    <span className="text-zinc-500">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                  <div className="h-1 bg-zinc-900 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-primary shadow-[0_0_8px_rgba(34,211,238,0.5)] transition-all duration-1000 ease-out" 
                      style={{ width: `${item.score}%` } as React.CSSProperties}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-cyan-500/5 border border-cyan-500/10">
            <div className="flex items-center gap-2 text-cyan-400 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Technician Notice</p>
            </div>
            <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-wider">
              All infrastructure layers are green. Database synced with Supabase pooler.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
