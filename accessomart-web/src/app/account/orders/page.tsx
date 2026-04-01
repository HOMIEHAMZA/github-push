'use client';

import { useEffect, useState } from 'react';
import { ordersApi } from '@/lib/api-client';
import { ApiOrder } from '@/lib/api-types';
import { 
  Package, 
  ChevronRight, 
  Search, 
  Filter,
  ExternalLink,
  Clock,
  CheckCircle2,
  Truck,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

export default function OrdersPage() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchOrders() {
      try {
        const { orders } = await ordersApi.list();
        setOrders(orders);
      } catch (error) {
        console.error('Failed to fetch orders', error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DELIVERED': return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'SHIPPED': return <Truck className="w-4 h-4 text-blue-400" />;
      case 'PROCESSING': 
      case 'CONFIRMED': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'CANCELLED': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-white/40" />;
    }
  };

  const filteredOrders = orders.filter(order => 
    order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.items.some(item => item.productName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00f2ff]">
          Order History
        </h1>
        <p className="mt-2 text-white/40">
          Track, manage, and review your past purchases.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search orders by number or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#111] border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm focus:outline-none focus:border-[#00f2ff]/50 transition-colors"
          />
        </div>
        <button className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#111] border border-white/5 rounded-xl text-sm font-medium hover:bg-white/5 transition-colors">
          <Filter className="w-4 h-4 text-white/40" />
          <span>Filter</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-6">
        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 bg-[#111] border border-white/5 rounded-2xl w-full"></div>
            ))}
          </div>
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden group transition-all hover:border-[#00f2ff]/30">
              {/* Order Header */}
              <div className="p-6 border-b border-white/5 bg-[#161616]/50 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center space-x-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Order Placed</p>
                    <p className="text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Total Amount</p>
                    <p className="text-sm font-bold text-[#00f2ff]">${Number(order.total).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-white/40 mb-1">Status</p>
                    <div className="flex items-center space-x-2">
                       {getStatusIcon(order.status)}
                       <span className="text-xs font-bold uppercase tracking-wider">{order.status}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <p className="text-xs font-mono text-white/40 tracking-wider">#{order.orderNumber}</p>
                  <Link 
                    href={`/checkout/success?session_id=${order.id}`} // Dummy for now, ideally an order detail page
                    className="p-2 rounded-lg bg-white/5 text-white/60 hover:text-[#00f2ff] hover:bg-[#00f2ff]/10 transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Order Items */}
              <div className="p-6">
                <div className="flex flex-col gap-6">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-xl bg-[#222] border border-white/5 flex-shrink-0 flex items-center justify-center p-2 overflow-hidden">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-6 h-6 text-white/10" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href="#" className="text-sm font-bold truncate block hover:text-[#00f2ff] transition-colors">
                          {item.productName}
                        </Link>
                        <p className="text-xs text-white/40 mt-1">
                          {item.variantName} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold">${Number(item.unitPrice).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tracking & Actions */}
                <div className="mt-8 flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/5">
                  <div className="flex items-center space-x-2 px-4 py-2 bg-[#1a1a1a] rounded-lg border border-white/5">
                    <Truck className="w-4 h-4 text-[#00f2ff]" />
                    <span className="text-xs font-medium text-white/60">
                      {order.trackingNumber ? `Tracking: ${order.trackingNumber}` : 'Preparing for shipment'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-bold uppercase tracking-widest">
                    <button className="px-5 py-2 bg-[#00f2ff] text-black rounded-lg hover:bg-white transition-colors">
                      Reorder Items
                    </button>
                    <button className="px-5 py-2 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                      Get Help
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 bg-[#111] border border-white/5 rounded-2xl border-dashed flex flex-col items-center justify-center text-center">
            <Package className="w-16 h-16 text-white/5 mb-4" />
            <p className="text-lg font-bold">No orders found</p>
            <p className="text-sm text-white/40 max-w-xs mx-auto mt-2">
              Looks like you haven't placed any orders yet. Start shopping to build your history!
            </p>
            <Link href="/products" className="mt-8 px-8 py-3 bg-[#00f2ff] text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all">
              Go Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
