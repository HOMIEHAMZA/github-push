'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, X, Save } from 'lucide-react';
import { ApiProduct, ApiBrand, ApiCategory, ApiProductImage } from '@/lib/api-types';
import { ImageUploader } from './ImageUploader';

interface ProductEditorProps {
  product: Partial<ApiProduct> | null;
  brands: ApiBrand[];
  categories: ApiCategory[];
  onSave: (product: Partial<ApiProduct>) => Promise<void>;
  onCancel: () => void;
}

export function ProductEditor({ product, brands, categories, onSave, onCancel }: ProductEditorProps) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    brandId: product?.brand?.id || '',
    categoryId: product?.category?.id || '',
    basePrice: product?.basePrice || 0,
    description: product?.description || '',
    status: product?.status || 'DRAFT',
    images: product?.images || []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSlugModified, setIsSlugModified] = useState(!!product?.slug);

  // Sync internal state if product prop changes (e.g. when opening for a different product)
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        brandId: product.brand?.id || '',
        categoryId: product.category?.id || '',
        basePrice: product.basePrice || 0,
        description: product.description || '',
        status: product.status || 'DRAFT',
        images: product.images || []
      });
      setIsSlugModified(!!product.slug);
    }
  }, [product]);

  const handleUpdateImages = (newImages: ApiProductImage[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const next = { ...prev, name };
      if (!isSlugModified) {
        next.slug = name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');
      }
      return next;
    });
  };

  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({ ...prev, slug }));
    if (!isSlugModified) setIsSlugModified(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (formData.basePrice === undefined || formData.basePrice <= 0)) return;

    // Final slug fallback
    const finalData = { ...formData };
    if (!finalData.slug) {
      finalData.slug = finalData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    try {
      setIsSaving(true);
      await onSave(finalData);
    } catch (err) {
      console.error('Submit Error:', err);
      // Error is handled by parent's toast
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              {product?.id ? 'Edit Asset Specs' : 'New Asset Specs'}
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              {product?.id ? `ID: ${product.id}` : 'Initialize system parameters'}
            </p>
          </div>
          <button 
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
            title="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GMMK Pro White Ice"
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Brand</label>
                  <select
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all appearance-none"
                    value={formData.brandId}
                    onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
                    title="Select Brand"
                  >
                    <option value="">No Brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Category</label>
                  <select
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all appearance-none"
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    title="Select Category"
                  >
                    <option value="">Uncategorized</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Asset Slug (Auto-gen if empty)</label>
                  <input
                    type="text"
                    placeholder="e.g. gmmk-pro-white"
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all font-mono text-[10px]"
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all"
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Terminal Status</label>
                  <select
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all appearance-none"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as ApiProduct['status'] })}
                    title="Select Status"
                  >
                    <option value="DRAFT">DRAFT</option>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="ARCHIVED">ARCHIVED</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">System Description</label>
                <textarea
                  placeholder="Detailed asset specifications..."
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary min-h-[150px] transition-all"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Visual Assets</label>
                {product?.id ? (
                  <ImageUploader 
                    productId={product.id} 
                    images={formData.images} 
                    onImagesChange={handleUpdateImages} 
                  />
                ) : (
                  <div className="p-8 border-2 border-dashed border-white/5 rounded-2xl bg-black/40 flex flex-col items-center justify-center text-center">
                    <p className="text-sm text-zinc-500">Image upload available after asset initialization.</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/10 bg-white/5 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-white/5 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest"
          >
            Abort
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-8 py-3 bg-primary text-black text-xs font-bold rounded-xl hover:bg-primary-light transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
          >
            {isSaving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Syncing...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Execute Save</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
