'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  TrendingUp, 
  Users, 
  ShoppingBag, 
  DollarSign,
  ArrowUpRight,
  Package
} from 'lucide-react';

export default function AdminOverview() {
  const { orders, products } = useAdminStore();

  const stats = [
    { label: 'Total Revenue', value: '$45,231.89', change: '+20.1%', icon: DollarSign, color: 'text-emerald-500' },
    { label: 'Total Orders', value: orders.length, change: '+12.5%', icon: ShoppingBag, color: 'text-primary' },
    { label: 'Total Customers', value: '1,240', change: '+4.3%', icon: Users, color: 'text-tertiary' },
    { label: 'Active Inventory', value: products.length, change: 'Stable', icon: Package, color: 'text-zinc-400' },
  ];

  return (
    <AdminLayout activeItem="Overview">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-12">
        {stats.map((stat, i) => (
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
            <h2 className="text-lg font-bold text-white">SYSTEM PULSE</h2>
            <button className="text-xs font-bold text-primary hover:text-white transition-colors">VIEW ALL</button>
          </div>
          
          <div className="space-y-6">
            {orders.map((order, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors border border-transparent hover:border-white/5">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400">
                    <TrendingUp size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{order.customerName}</h4>
                    <p className="text-xs text-zinc-500">Order {order.id} • {order.items} Items</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-white">${order.total.toFixed(2)}</p>
                  <p className="text-[10px] text-primary uppercase font-bold">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div className="p-8 rounded-3xl bg-white/5 border border-white/10 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-white mb-6">COMPUTE STATUS</h2>
            <div className="space-y-6">
              {[
                { label: 'Edge Latency', value: '24ms', score: 98 },
                { label: 'Database Health', value: 'Optimal', score: 100 },
                { label: 'Inventory Sync', value: '4m ago', score: 92 }
              ].map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-zinc-500 uppercase tracking-widest">{item.label}</span>
                    <span className="text-white font-bold">{item.value}</span>
                  </div>
                  <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${item.score}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-12 p-6 rounded-2xl bg-primary/10 border border-primary/20">
            <p className="text-xs font-bold text-primary uppercase tracking-widest mb-2">Notice</p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              All systems operational. Peak traffic detected in Keyboard category.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
