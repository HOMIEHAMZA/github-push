'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { adminApi } from '@/lib/api-client';
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
import { ProductEditor, PartialProductUpdate } from '@/components/admin/ProductEditor';
import { ApiProduct, ApiBrand, ApiCategory } from '@/lib/api-types';
import Image from 'next/image';

export default function ProductManager() {
  const { addToast } = useToastStore();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ApiProduct | null>(null);
  const [brands, setBrands] = useState<ApiBrand[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number | boolean | undefined> = {};
      if (searchTerm) params.search = searchTerm;
      const response = await adminApi.getProducts(params);
      setProducts(response.products || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      addToast('Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, addToast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandsRes, categoriesRes] = await Promise.all([
          adminApi.getBrands(),
          adminApi.getCategories()
        ]);
        setBrands(brandsRes.brands || []);
        setCategories(categoriesRes.categories || []);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };
    fetchMetadata();
  }, []);

  const handleSave = async (formData: PartialProductUpdate) => {
    const isEditing = !!editingProduct;
    const originalProducts = [...products];

    try {
      if (isEditing && editingProduct?.id) {
        // Strip image arrays and relational objects — variants and specs ARE included in saveData
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { images: _images, brand: _brand, category: _category, ...saveData } = formData as ApiProduct;

        // Optimistic update with existing data while we wait for API
        const optimistic = { ...editingProduct, ...saveData } as ApiProduct;
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? optimistic : p));
        
        await adminApi.updateProduct(editingProduct.id, saveData as unknown as Partial<ApiProduct>);
        addToast('Asset parameters updated', 'success');
        setEditingProduct(null);
      } else {
        // Create - no ID yet, so we wait for API
        await adminApi.createProduct(formData as unknown as Partial<ApiProduct>);
        addToast('New asset initialized successfully', 'success');
        setIsAdding(false);
      }
      
      // Always refresh to sync with server-side computed fields and images
      fetchProducts();
    } catch (error) {
      const err = error as Error;
      console.error('Failed to save product:', error);
      addToast(err.message || 'Operation failed', 'error');
      
      // Revert on error
      if (isEditing) {
        setProducts(originalProducts);
      }
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'ACTIVE' ? 'DRAFT' : 'ACTIVE';
      await adminApi.updateProduct(id, { status: newStatus });
      addToast('Product status updated', 'success');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to update product status:', error);
      addToast('Failed to update product status', 'error');
    }
  };

  const handleArchiveProduct = async (id: string) => {
    if (!confirm('Are you sure you want to archive this product?')) return;

    try {
      await adminApi.archiveProduct(id);
      addToast('Product archived', 'success');
      fetchProducts(); // Refresh the list
    } catch (error) {
      console.error('Failed to archive product:', error);
      addToast('Failed to archive product', 'error');
    }
  };

  const getTotalStock = (product: ApiProduct) => {
    return product.variants.reduce((sum, variant) =>
      sum + (variant.inventory?.quantity || 0), 0
    );
  };

  const getPrimaryImage = (product: ApiProduct) => {
    const primary = product.images.find(img => img.isPrimary);
    return primary?.url || (product.images[0]?.url || '/images/keyboard.png');
  };

  return (
    <AdminLayout activeItem="Products">
      {/* Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Filter by name or brand..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-sm text-white focus:outline-none focus:border-primary transition-all"
          />
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 px-6 py-3 bg-primary text-black font-bold rounded-2xl hover:bg-primary-light transition-all active:scale-95"
        >
          <Plus size={20} />
          <span>DEPLOY NEW ASSET</span>
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

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={32} />
          <span className="ml-3 text-white">Loading assets...</span>
        </div>
      )}

      {/* Product Table */}
      {!loading && (
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/2">
          <div className="px-6 py-4 border-b border-white/10 bg-white/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Package size={18} className="text-zinc-500" />
                <span className="text-sm font-bold text-white uppercase tracking-tight">
                  {total} ASSETS DEPLOYED
                </span>
              </div>
              <span className="text-xs text-zinc-500">
                Showing {products.length} of {total}
              </span>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/10">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Product</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Price</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Stock</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Package className="text-zinc-700 mb-3" size={48} />
                      <p className="text-zinc-500 text-sm">No products found</p>
                      <p className="text-zinc-600 text-xs mt-1">Try adjusting your search or create a new product</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const totalStock = getTotalStock(product);
                  const primaryImage = getPrimaryImage(product);

                  return (
                    <tr key={product.id} className="group hover:bg-white/5 transition-colors border-b border-white/5 last:border-0">
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 rounded-xl bg-black border border-white/5 flex items-center justify-center overflow-hidden relative">
                            <Image 
                              src={primaryImage} 
                              alt={`${product.name} visual asset`} 
                              fill
                              sizes="48px"
                              className="object-contain p-1.5" 
                              unoptimized={primaryImage.startsWith('/images/')}
                            />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white uppercase tracking-tight">{product.name}</p>
                            <p className="text-[10px] text-zinc-500 uppercase">{product.brand?.name || 'No brand'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-mono text-sm text-white">${Number(product.basePrice || 0).toFixed(2)}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2">
                          <div className={cn("w-1.5 h-1.5 rounded-full", totalStock < 10 ? "bg-amber-500" : "bg-primary")} />
                          <span className="text-sm font-medium text-white">{totalStock}</span>
                          <span className="text-xs text-zinc-500">({product.variants?.length || 0} variants)</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleUpdateStatus(product.id, product.status)}
                          className={cn(
                            "text-[10px] font-bold px-3 py-1 rounded-full border transition-all",
                            product.status === 'ACTIVE'
                              ? "text-emerald-500 border-emerald-500/20 bg-emerald-500/10 hover:bg-emerald-500/20"
                              : product.status === 'DRAFT'
                                ? "text-amber-500 border-amber-500/20 bg-amber-500/10 hover:bg-amber-500/20"
                                : "text-zinc-500 border-zinc-700 bg-zinc-800/50 hover:text-white"
                          )}
                        >
                          {product.status}
                        </button>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setEditingProduct(product)}
                            className="p-2 rounded-lg bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all"
                            title="Edit Asset Details"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleArchiveProduct(product.id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:text-red-300 hover:bg-red-500/20 transition-all"
                            title="Archive Asset"
                          >
                            <Trash2 size={16} />
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
      )}
    </AdminLayout>
  );
}
