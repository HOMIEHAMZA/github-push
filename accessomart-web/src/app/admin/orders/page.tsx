'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api-client';
import { ApiOrder, OrderStatus } from '@/lib/api-types';
import { useToastStore } from '@/store/useToastStore';
import { LucideIcon, ShoppingBag, ExternalLink, CheckCircle2, Clock, Truck, XCircle, PackageCheck, Loader2, RefreshCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

const statusConfig: Record<OrderStatus, { icon: LucideIcon, color: string, bg: string, label: string }> = {
  'PENDING': { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10 border-amber-500/20', label: 'Pending' },
  'CONFIRMED': { icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', label: 'Confirmed' },
  'PROCESSING': { icon: PackageCheck, color: 'text-primary', bg: 'bg-primary/10 border-primary/20', label: 'Processing' },
  'SHIPPED': { icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20', label: 'Shipped' },
  'DELIVERED': { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', label: 'Delivered' },
  'CANCELLED': { icon: XCircle, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20', label: 'Cancelled' },
  'REFUNDED': { icon: RefreshCcw, color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/20', label: 'Refunded' },
};

const statusOrder: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PROCESSING',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED'
];

export default function OrderManager() {
  const { addToast } = useToastStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await adminApi.getOrders();
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      setUpdatingOrderId(orderId);
      await adminApi.updateOrderStatus(orderId, newStatus);
      addToast('Order status updated', 'success');

      // Update local state
      setOrders(prev => prev.map(order =>
        order.id === orderId ? { ...order, status: newStatus } : order
      ));
    } catch (error) {
      console.error('Failed to update order status:', error);
      addToast('Failed to update order status', 'error');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const getCustomerName = (order: ApiOrder) => {
    if (!order.user) return 'Guest Customer';
    return `${order.user.firstName} ${order.user.lastName}`.trim() || order.user.email;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <AdminLayout activeItem="Orders">
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="ml-3 text-white">Loading transmissions...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const config = statusConfig[order.status];
            const Icon = config.icon;
            const isUpdating = updatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
              >
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                  <div className="flex items-center space-x-6">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-500">
                      <Icon size={24} strokeWidth={1.5} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h3 className="text-base font-bold text-white uppercase tracking-tight">
                          {order.orderNumber || `ORD-${order.id.slice(-8).toUpperCase()}`}
                        </h3>
                        <span className={cn(
                          "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                          config.bg,
                          config.color
                        )}>
                          {config.label}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-400 font-medium">
                        {getCustomerName(order)} • {order._count?.items || 0} Items • {formatDate(order.createdAt)}
                      </p>
                      {order.payment && (
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                          Paid via {order.payment.provider} • {order.payment.status}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="text-right mr-4">
                      <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Total Amount</p>
                      <p className="text-lg font-display font-bold text-white">${Number(order.total || 0).toFixed(2)}</p>
                    </div>

                    <div className="h-10 w-px bg-white/5 hidden xl:block" />

                    <div className="flex items-center space-x-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
                      {statusOrder.map((status) => {
                        const isCurrent = order.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => !isUpdating && handleUpdateStatus(order.id, status)}
                            disabled={isUpdating || isCurrent}
                            className={cn(
                              "px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all uppercase tracking-tighter flex items-center justify-center min-w-[80px]",
                              isCurrent
                                ? "bg-white/10 text-white border border-white/10"
                                : "text-zinc-600 hover:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                            aria-label={`Change status to ${statusConfig[status].label}`}
                          >
                            {isUpdating && isCurrent ? (
                              <Loader2 className="animate-spin mr-1" size={12} />
                            ) : null}
                            {statusConfig[status].label}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => addToast(`Order details for ${order.orderNumber || order.id} coming in next transmission`, 'info')}
                      className="p-3 rounded-xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all border border-transparent hover:border-white/10"
                      aria-label="View order details"
                    >
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && orders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-700 mb-6">
            <ShoppingBag size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">Zero Orders Detected</h3>
          <p className="text-zinc-500 max-w-xs leading-relaxed">
            The transmission stream is currently empty. No active transactions found in the matrix.
          </p>
        </div>
      )}
    </AdminLayout>
  );
}
