'use client';

import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api-client';
import { ApiCustomer } from '@/lib/api-types';
import { useToastStore } from '@/store/useToastStore';
import {
    Users,
    Search,
    Mail,
    Calendar,
    ShoppingBag,
    CheckCircle,
    XCircle,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CustomerManager() {
    const { addToast } = useToastStore();
    const [customers, setCustomers] = useState<ApiCustomer[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async () => {
        try {
            setLoading(true);
            const params: Record<string, string> = {};
            if (searchTerm) params.search = searchTerm;
            const response = await adminApi.getCustomers(params);
            setCustomers(response.customers || []);
        } catch (error) {
            console.error('Failed to fetch customers:', error);
            addToast('Failed to load customers', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCustomers();
    }, [searchTerm]);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getCustomerName = (customer: ApiCustomer) => {
        if (customer.firstName && customer.lastName) {
            return `${customer.firstName} ${customer.lastName}`;
        }
        if (customer.firstName) return customer.firstName;
        if (customer.lastName) return customer.lastName;
        return 'Unnamed Customer';
    };

    const getInitials = (customer: ApiCustomer) => {
        const name = getCustomerName(customer);
        return name
            .split(' ')
            .map(part => part[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AdminLayout activeItem="Customers">
            {/* Action Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-primary transition-all"
                        aria-label="Search customers"
                    />
                </div>

                <div className="flex items-center space-x-4">
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10">
                        <span className="text-xs text-zinc-500 uppercase tracking-widest mr-2">Total</span>
                        <span className="text-sm font-bold text-white">{customers.length}</span>
                    </div>
                </div>
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-primary" size={32} />
                    <span className="ml-3 text-white">Loading user database...</span>
                </div>
            )}

            {/* Customers Grid */}
            {!loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {customers.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
                            <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-zinc-700 mb-6">
                                <Users size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-tight">No Users Found</h3>
                            <p className="text-zinc-500 max-w-xs leading-relaxed">
                                No customer profiles match your search criteria.
                            </p>
                        </div>
                    ) : (
                        customers.map((customer) => (
                            <div
                                key={customer.id}
                                className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                            >
                                <div className="flex items-start justify-between mb-6">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-white font-bold text-lg">
                                            {getInitials(customer)}
                                        </div>
                                        <div>
                                            <h3 className="text-base font-bold text-white uppercase tracking-tight">
                                                {getCustomerName(customer)}
                                            </h3>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <Mail size={12} className="text-zinc-500" />
                                                <p className="text-xs text-zinc-400 font-medium truncate max-w-[200px]">
                                                    {customer.email}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "flex items-center space-x-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                        customer.isActive
                                            ? "text-emerald-500 bg-emerald-500/10 border border-emerald-500/20"
                                            : "text-zinc-500 bg-zinc-800/50 border border-zinc-700"
                                    )}>
                                        {customer.isActive ? (
                                            <>
                                                <CheckCircle size={10} />
                                                <span>Active</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle size={10} />
                                                <span>Inactive</span>
                                            </>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 rounded-xl bg-black/40 border border-white/5">
                                        <div className="flex items-center space-x-3">
                                            <ShoppingBag size={16} className="text-zinc-500" />
                                            <div>
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Orders</p>
                                                <p className="text-sm font-bold text-white">{customer._count.orders}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                            <Calendar size={16} className="text-zinc-500" />
                                            <div className="text-right">
                                                <p className="text-[10px] text-zinc-500 uppercase tracking-[0.2em]">Joined</p>
                                                <p className="text-sm font-medium text-zinc-400">{formatDate(customer.createdAt)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex space-x-3">
                                        <button
                                            className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all"
                                            aria-label={`View details for ${getCustomerName(customer)}`}
                                        >
                                            VIEW PROFILE
                                        </button>
                                        <button
                                            className="flex-1 py-2.5 text-center text-xs font-bold text-white bg-primary/10 rounded-xl border border-primary/20 hover:bg-primary/20 transition-all"
                                            aria-label={`Contact ${getCustomerName(customer)}`}
                                        >
                                            CONTACT
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </AdminLayout>
    );
}