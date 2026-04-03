'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api-client';
import { useToastStore } from '@/store/useToastStore';
import {
    Warehouse,
    Search,
    Package,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Plus,
    Minus,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { ApiInventoryItem } from '@/lib/api-types';

export default function InventoryManager() {
    const { addToast } = useToastStore();
    const [inventory, setInventory] = useState<ApiInventoryItem[]>([]);
    const [lowStock, setLowStock] = useState<ApiInventoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
    const [adjustmentValue, setAdjustmentValue] = useState<Record<string, number>>({});

    const fetchInventory = useCallback(async () => {
        try {
            setLoading(true);
            const [invRes, lowRes] = await Promise.all([
                adminApi.getInventory(),
                adminApi.getLowStock()
            ]);
            setInventory(invRes.inventoryItems || []);
            setLowStock(lowRes.lowStockItems || []);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            addToast('Failed to load inventory', 'error');
        } finally {
            setLoading(false);
        }
    }, [addToast]);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    const handleAdjustInventory = async (variantId: string, operation: 'adjust' | 'set', value: number) => {
        try {
            setUpdatingItemId(variantId);
            await adminApi.updateInventory(variantId, {
                quantity: value,
                operation
            });
            addToast('Inventory updated successfully', 'success');
            fetchInventory(); // Refresh data
            setAdjustmentValue(prev => ({ ...prev, [variantId]: 0 }));
        } catch (error) {
            console.error('Failed to update inventory:', error);
            addToast('Failed to update inventory', 'error');
        } finally {
            setUpdatingItemId(null);
        }
    };

    const handleQuickAdjust = (variantId: string, delta: number) => {
        const item = inventory.find(i => i.variantId === variantId);
        if (!item) return;

        const newQuantity = Math.max(0, item.quantity + delta);
        handleAdjustInventory(variantId, 'set', newQuantity);
    };

    const filteredInventory = inventory.filter(item =>
        item.variant.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.variant.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStockStatus = (quantity: number, threshold: number) => {
        if (quantity === 0) return { label: 'Out of Stock', color: 'text-red-500', bg: 'bg-red-500/10', icon: XCircle };
        if (quantity <= threshold) return { label: 'Low Stock', color: 'text-amber-500', bg: 'bg-amber-500/10', icon: AlertTriangle };
        return { label: 'In Stock', color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle };
    };

    return (
        <AdminLayout activeItem="Inventory">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-primary transition-all"
                        aria-label="Search inventory"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <div className={cn(
                        "px-4 py-2 rounded-xl border flex items-center space-x-2",
                        lowStock.length > 0
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                            : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                    )}>
                        <AlertTriangle size={14} />
                        <span className="text-xs font-bold uppercase tracking-widest">Low Stock</span>
                        <span className="text-sm font-bold">{lowStock.length}</span>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2">Total Items</span>
                        <span className="text-sm font-bold text-white">{inventory.length}</span>
                    </div>
                </div>
            </div>

            {/* Low Stock Warning */}
            {lowStock.length > 0 && (
                <div className="mb-8 p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20">
                    <div className="flex items-center space-x-3 mb-3">
                        <AlertTriangle className="text-amber-500" size={20} />
                        <h3 className="text-base font-bold text-amber-500 uppercase tracking-tight">
                            Low Stock Alert ({lowStock.length} items)
                        </h3>
                    </div>
                    <p className="text-sm text-amber-400/80 mb-4">
                        The following items are below their minimum stock threshold and may need replenishment.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {lowStock.slice(0, 3).map(item => (
                            <div key={item.id} className="p-3 rounded-xl bg-black/40 border border-amber-500/20">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-xs font-bold text-white truncate">{item.variant.product.name}</p>
                                        <p className="text-[10px] text-amber-400 uppercase tracking-widest">{item.variant.sku}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-bold text-amber-500">{item.quantity} units</p>
                                        <p className="text-[10px] text-amber-400/60">Threshold: {item.lowStockThreshold}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {lowStock.length > 3 && (
                            <div className="p-3 rounded-xl bg-black/40 border border-amber-500/20 flex items-center justify-center">
                                <span className="text-xs text-amber-400">+{lowStock.length - 3} more items</span>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-white">Loading inventory data...</span>
                </div>
            )}

            {/* Inventory Table */}
            {!loading && (
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/2">
                    <div className="px-6 py-4 border-b border-white/10 bg-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Warehouse size={18} className="text-zinc-500" />
                                <span className="text-sm font-bold text-white uppercase tracking-tight">
                                    INVENTORY MANAGEMENT
                                </span>
                            </div>
                            <span className="text-xs text-zinc-500">
                                {filteredInventory.length} items
                            </span>
                        </div>
                    </div>

                    <div className="divide-y divide-white/5">
                        {filteredInventory.length === 0 && inventory.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <Package className="text-zinc-700 mb-3" size={48} />
                                    <p className="text-zinc-500 text-sm">No inventory items found</p>
                                    <p className="text-zinc-600 text-xs mt-1">Add variants to your products to track inventory</p>
                                </div>
                            </div>
                        ) : filteredInventory.length === 0 && searchTerm ? (
                            <div className="px-6 py-12 text-center">
                                <div className="flex flex-col items-center justify-center">
                                    <Package className="text-zinc-700 mb-3" size={48} />
                                    <p className="text-zinc-500 text-sm">No results for &quot;{searchTerm}&quot;</p>
                                    <p className="text-zinc-600 text-xs mt-1">Try a different search term</p>
                                </div>
                            </div>
                        ) : (
                            filteredInventory.map((item) => {
                                const status = getStockStatus(item.quantity, item.lowStockThreshold);
                                const StatusIcon = status.icon;
                                const isUpdating = updatingItemId === item.variantId;
                                const adjustment = adjustmentValue[item.variantId] || 0;

                                return (
                                    <div key={item.id} className="p-6 hover:bg-white/2 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="flex-1">
                                                <div className="flex items-start space-x-4">
                                                    <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center text-zinc-500">
                                                        <Package size={20} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center space-x-3 mb-1">
                                                            <h3 className="text-sm font-bold text-white uppercase tracking-tight">
                                                                {item.variant.product.name}
                                                            </h3>
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-widest",
                                                                status.bg,
                                                                status.color
                                                            )}>
                                                                <StatusIcon size={10} className="inline mr-1" />
                                                                {status.label}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-400">
                                                            <span className="font-mono bg-black/40 px-2 py-1 rounded">
                                                                SKU: {item.variant.sku}
                                                            </span>
                                                            <span>Variant: {item.variant.name}</span>
                                                            {item.variant.product.brand && (
                                                                <span>Brand: {item.variant.product.brand.name}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                                {/* Stock Display */}
                                                <div className="text-center sm:text-right">
                                                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-[0.2em] mb-1">Current Stock</p>
                                                    <div className="flex items-center justify-center sm:justify-end space-x-2">
                                                        <div className={cn(
                                                            "w-2 h-2 rounded-full",
                                                            status.color.replace('text-', 'bg-')
                                                        )} />
                                                        <p className="text-2xl font-display font-bold text-white">{item.quantity}</p>
                                                        <span className="text-xs text-zinc-500">units</span>
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 mt-1">
                                                        Threshold: <span className="font-bold">{item.lowStockThreshold}</span>
                                                    </p>
                                                </div>

                                                <div className="h-10 w-px bg-white/5 hidden sm:block" />

                                                {/* Quick Actions */}
                                                <div className="flex flex-col space-y-3 min-w-[200px]">
                                                    <div className="flex items-center space-x-2">
                                                        <button
                                                            onClick={() => handleQuickAdjust(item.variantId, -1)}
                                                            disabled={isUpdating || item.quantity <= 0}
                                                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label="Decrease stock by 1"
                                                        >
                                                            <Minus size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickAdjust(item.variantId, 1)}
                                                            disabled={isUpdating}
                                                            className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label="Increase stock by 1"
                                                        >
                                                            <Plus size={16} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleQuickAdjust(item.variantId, 10)}
                                                            disabled={isUpdating}
                                                            className="p-2 rounded-lg bg-primary/10 text-primary hover:text-primary-light hover:bg-primary/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            aria-label="Increase stock by 10"
                                                        >
                                                            <span className="text-xs font-bold">+10</span>
                                                        </button>
                                                    </div>

                                                    {/* Manual Adjustment */}
                                                    <div className="flex items-center space-x-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            value={adjustment}
                                                            onChange={(e) => setAdjustmentValue(prev => ({
                                                                ...prev,
                                                                [item.variantId]: parseInt(e.target.value) || 0
                                                            }))}
                                                            className="flex-1 px-3 py-1.5 bg-black border border-white/10 rounded-lg text-white text-sm outline-none focus:border-primary"
                                                            placeholder="Set quantity"
                                                            aria-label="Set exact quantity"
                                                        />
                                                        <button
                                                            onClick={() => handleAdjustInventory(item.variantId, 'set', adjustment)}
                                                            disabled={isUpdating || adjustment < 0}
                                                            className="px-3 py-1.5 bg-white/5 text-white text-xs font-bold rounded-lg border border-white/10 hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {isUpdating ? <Loader2 className="animate-spin" size={12} /> : 'SET'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}