'use client';

import { useAuthStore } from '@/store/useAuthStore';
import { 
  Package, 
  MapPin, 
  Heart, 
  Clock, 
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ordersApi, wishlistApi, addressApi } from '@/lib/api-client';
import { ApiOrder, ApiAddress } from '@/lib/api-types';

export default function AccountDashboard() {
  // user is intentionally left unused for potential future UI personalization
  // const { user } = useAuthStore();
  const [recentOrders, setRecentOrders] = useState<ApiOrder[]>([]);
  const [defaultAddress, setDefaultAddress] = useState<ApiAddress | null>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [ordersRes, wishlistRes, addressRes] = await Promise.all([
        ordersApi.list(),
        wishlistApi.get(),
        addressApi.list()
      ]);
      setRecentOrders(ordersRes.orders.slice(0, 3));
      setWishlistCount(wishlistRes.wishlist.length);
      setDefaultAddress(addressRes.addresses.find(a => a.isDefault) || addressRes.addresses[0] || null);
    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
      setError(err instanceof Error ? err.message : 'Interfacing failure. Critical data retrieval unsuccessful.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = [
    { label: 'Total Orders', value: recentOrders.length, icon: Package, color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { label: 'Wishlist Items', value: wishlistCount, icon: Heart, color: 'text-pink-400', bg: 'bg-pink-400/10' },
    { label: 'Saved Addresses', value: defaultAddress ? 1 : 0, icon: MapPin, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
  ];

  return (
    <div className="space-y-8">
      {/* Error State */}
      {error && (
        <div className="p-6 bg-red-400/5 border border-red-400/20 rounded-2xl flex flex-col items-center text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <div>
            <h3 className="text-lg font-bold text-red-400">System Link Failure</h3>
            <p className="text-sm text-white/60 mt-1">{error}</p>
          </div>
          <button 
            onClick={() => fetchData()}
            className="px-6 py-2 bg-red-400 text-black font-bold rounded-lg hover:bg-red-500 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="p-6 bg-[#111] border border-white/5 rounded-2xl flex items-center space-x-4">
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-white/40 font-medium uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link href="/account/orders" className="text-sm font-medium text-[#00f2ff] hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-6">
            {isLoading ? (
              <div className="space-y-4 animate-pulse">
                {[1, 2].map((i) => (
                  <div key={i} className="h-16 bg-white/5 rounded-xl w-full"></div>
                ))}
              </div>
            ) : recentOrders.length > 0 ? (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/2 overflow-hidden transition-all hover:border-[#00f2ff]/30">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 rounded-lg bg-[#222] flex items-center justify-center border border-white/5">
                        <TrendingUp className="w-5 h-5 text-[#00f2ff]" />
                      </div>
                      <div>
                        <p className="text-sm font-bold uppercase tracking-wider">#{order.orderNumber}</p>
                        <p className="text-xs text-white/40">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#00f2ff]">${Number(order.total).toFixed(2)}</p>
                      <p className={`text-[10px] font-bold uppercase ${
                        order.status === 'DELIVERED' ? 'text-emerald-400' : 
                        order.status === 'CANCELLED' ? 'text-red-400' : 'text-blue-400'
                      }`}>
                        {order.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-white/10 mx-auto mb-3" />
                <p className="text-sm text-white/40">No orders placed yet.</p>
                <Link href="/products" className="mt-4 inline-block text-sm font-bold text-[#00f2ff] px-6 py-2 bg-[#00f2ff]/10 rounded-lg border border-[#00f2ff]/20">
                  Shop Now
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Default Address & Security */}
        <div className="space-y-8">
          <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#00f2ff]" />
              Shipping Address
            </h2>
            {defaultAddress ? (
              <div className="p-4 bg-white/5 rounded-xl border border-[#00f2ff]/20">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#00f2ff] bg-[#00f2ff]/10 px-2 py-0.5 rounded leading-tight">Default</span>
                  <Link href="/account/addresses" className="text-xs text-white/40 hover:text-white underline">Change</Link>
                </div>
                <p className="text-sm font-bold">{defaultAddress.firstName} {defaultAddress.lastName}</p>
                <p className="text-sm text-white/60">{defaultAddress.line1}</p>
                {defaultAddress.line2 && <p className="text-sm text-white/60">{defaultAddress.line2}</p>}
                <p className="text-sm text-white/60">{defaultAddress.city}, {defaultAddress.state} {defaultAddress.postalCode}</p>
                <p className="text-sm text-white/60">{defaultAddress.country}</p>
              </div>
            ) : (
              <div className="p-6 text-center border-2 border-dashed border-white/5 rounded-xl">
                 <p className="text-sm text-white/40 mb-4">No addresses saved yet.</p>
                 <Link href="/account/addresses" className="text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-lg border border-white/10 hover:border-[#00f2ff]/50 transition-all">
                  Add Address
                 </Link>
              </div>
            )}
          </div>

          <div className="p-6 bg-gradient-to-br from-[#00f2ff]/5 to-[#7000ff]/5 border border-[#00f2ff]/10 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <ShieldCheck className="w-24 h-24 text-white" />
            </div>
            <div className="relative z-10">
              <h3 className="font-bold flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#00f2ff]" />
                Security & Verification
              </h3>
              <p className="text-xs text-white/60 mb-4 leading-relaxed max-w-[80%]">
                Your account is protected by industry-standard encryption. Enable two-factor authentication for enhanced security.
              </p>
              <button className="text-xs font-bold px-4 py-2 bg-white text-black rounded-lg hover:bg-[#00f2ff] transition-colors">
                Security Settings
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
