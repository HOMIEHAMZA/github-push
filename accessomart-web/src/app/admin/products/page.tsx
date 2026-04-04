'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/useAdminStore';
import { useToastStore } from '@/store/useToastStore';
import {
  Package,
  Plus,
  Search,
  Edit3,
  Trash2,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProductEditor } from '@/components/admin/ProductEditor';
import { ApiProduct, ProductStatus } from '@/lib/api-types';
import Image from 'next/image';

export default function ProductManager() {
  const { addToast } = useToastStore();
  const { 
    products, 
    brands, 
    categories, 
    isLoading, 
    fetchProducts, 
    fetchMetadata,
    createProduct,
    updateProduct: updateProductInStore,
    archiveProduct: archiveProductInStore
  } = useAdminStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);

  const performFetch = useCallback(async () => {
    const params: Record<string, string | number | boolean> = {};
    if (searchTerm) params.search = searchTerm;
    await fetchProducts(params);
  }, [searchTerm, fetchProducts]);

  useEffect(() => {
    performFetch();
  }, [performFetch]);

  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  const handleSave = async (formData: Partial<ApiProduct>) => {
    try {
      if (editingProduct?.id) {
        // Strip non-editable nested objects before update
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images: _images, variants: _variants, brand: _brand, category: _category, ...saveData } = formData as ApiProduct;
        
        await updateProductInStore(editingProduct.id, saveData);
        addToast('Asset parameters updated successfully', 'success');
        setEditingProduct(null);
      } else {
        await createProduct(formData);
        addToast('New hardware asset initialized', 'success');
        setIsAdding(false);
      }
    } catch (error) {
      const err = error as Error;
      addToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      await updateProductInStore(id, { status: newStatus as ProductStatus });
      addToast('Status toggled', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Status update failed', 'error');
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Move asset to archive? This will hide it from the public store.')) return;
    try {
      await archiveProductInStore(id);
      addToast('Asset archived', 'success');
    } catch (err: unknown) {
      addToast(err instanceof Error ? err.message : 'Archive operation failed', 'error');
    }
  };

  const getPrimaryImage = (product: ApiProduct) => {
    const primary = product.images?.find(img => img.isPrimary);
    return primary?.url || (product.images?.[0]?.url || '/images/keyboard.png');
  };

  return (
    <AdminLayout activeItem="Products">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Filter assets by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-xs text-white focus:outline-none focus:border-primary transition-all placeholder:text-zinc-600"
          />
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-95 text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(34,211,238,0.2)]"
        >
          <Plus size={16} />
          <span>INITIALIZE ASSET</span>
        </button>
      </div>

      {/* Editor Modal */}
      {(isAdding || editingProduct) && (
        <ProductEditor
          product={editingProduct}
          brands={brands}
          categories={categories}
          onSave={handleSave}
          onCancel={() => {
            setIsAdding(false);
            setEditingProduct(null);
          }}
        />
      )}

      {/* Product Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/2 backdrop-blur-sm">
        <div className="px-6 py-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package size={14} className="text-zinc-500" />
            <span className="text-[10px] font-bold text-white uppercase tracking-[0.2em]">
              HARDWARE INVENTORY ({products.length})
            </span>
          </div>
          {isLoading && <Loader2 className="animate-spin text-primary" size={14} />}
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10">
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Product</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Price</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Status</th>
              <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Control</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading && products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Package className="text-zinc-800 mb-3" size={32} />
                    <p className="text-[10px] text-zinc-500 uppercase tracking-widest text-center">No assets matched your search query.</p>
                  </div>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const primaryImage = getPrimaryImage(product);

                return (
                  <tr key={product.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-lg bg-black border border-white/5 flex items-center justify-center overflow-hidden relative grayscale group-hover:grayscale-0 transition-all">
                          <Image 
                            src={primaryImage} 
                            alt={product.name} 
                            fill
                            sizes="40px"
                            className="object-contain p-1.5" 
                            unoptimized={primaryImage.startsWith('/images/')}
                          />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white uppercase tracking-tight">{product.name}</p>
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest">
                            {product.brand?.name || 'GENERIC'} • {product.category?.name || 'GLOBAL'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 font-mono text-xs text-white">
                      ${Number(product.basePrice || 0).toFixed(2)}
                    </td>
                    <td className="px-6 py-5">
                      <button
                        onClick={() => handleUpdateStatus(product.id, product.status)}
                        title={`Change ${product.name} status to ${product.status === 'ACTIVE' ? 'DRAFT' : 'ACTIVE'}`}
                        className={cn(
                          "text-[9px] font-bold px-3 py-1 rounded-full border transition-all uppercase tracking-widest",
                          product.status === 'ACTIVE'
                            ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10"
                            : "text-amber-500 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10"
                        )}
                      >
                        {product.status}
                      </button>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center space-x-2 opacity-20 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => setEditingProduct(product)}
                          title="View Technical Details / Edit Asset"
                          className="p-1.5 rounded-lg bg-white/5 text-zinc-500 hover:text-white hover:bg-white/10 transition-all text-xs flex items-center justify-center"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          onClick={() => handleArchive(product.id)}
                          title="Purge Asset from Public View (Archive)"
                          className="p-1.5 rounded-lg bg-red-500/5 text-red-500/50 hover:text-red-400 hover:bg-red-500/10 transition-all text-xs flex items-center justify-center"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
