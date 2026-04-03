'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, X, Save, Wand2 } from 'lucide-react';
import { ApiProduct, ApiBrand, ApiCategory, ApiProductImage } from '@/lib/api-types';
import { ImageUploader } from './ImageUploader';
import { adminApi } from '@/lib/api-client';

interface ProductEditorProps {
  product: Partial<ApiProduct> | null;
  brands: ApiBrand[];
  categories: ApiCategory[];
  onSave: (product: Partial<ApiProduct>) => Promise<void>;
  onCancel: () => void;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function ProductEditor({ product, brands, categories, onSave, onCancel }: ProductEditorProps) {
  const isEditing = !!(product?.id);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    brandId: product?.brand?.id || '',
    categoryId: product?.category?.id || '',
    basePrice: product?.basePrice || 0,
    description: product?.description || '',
    status: product?.status || 'DRAFT',
    images: product?.images || [] as ApiProductImage[],
  });

  const [isSaving, setIsSaving] = useState(false);
  // For NEW products: slug tracks name auto-magically until user edits it manually.
  // For EXISTING products: slug is already set; auto-sync is off by default.
  const [isSlugManual, setIsSlugManual] = useState(isEditing && !!product?.slug);

  // Re-sync when the product prop changes (e.g. switching between edit modals)
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
        images: product.images || [],
      });
      // Treat existing slug as manually set so edits don't clobber it
      setIsSlugManual(!!(product.id && product.slug));
    }
  }, [product]);

  // When editing an existing product, fetch full details so we get ALL images
  // (the products list only returns 1 thumbnail image per product for performance)
  useEffect(() => {
    if (!isEditing || !product?.id) return;

    let cancelled = false;
    adminApi.getProduct(product.id).then(res => {
      if (cancelled) return;
      const fullImages = res.product?.images || [];
      if (fullImages.length > 0) {
        setFormData(prev => ({ ...prev, images: fullImages }));
      }
    }).catch(err => {
      console.warn('Could not fetch full product images:', err);
    });

    return () => { cancelled = true; };
  // Only run when opening the editor for a specific product id
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const handleUpdateImages = useCallback((newImages: ApiProductImage[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  }, []);

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const next = { ...prev, name };
      // Auto-generate slug from name if user hasn't manually edited the slug field
      if (!isSlugManual) {
        next.slug = slugify(name);
      }
      return next;
    });
  };

  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({ ...prev, slug }));
    // Once the user types in the slug field, lock it from auto-updates
    setIsSlugManual(true);
  };

  const resetSlugToAuto = () => {
    setIsSlugManual(false);
    setFormData(prev => ({ ...prev, slug: slugify(prev.name) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;
    if (!formData.basePrice || formData.basePrice <= 0) return;

    // Ensure slug is set
    const finalSlug = formData.slug.trim() || slugify(formData.name);

    // Build payload — convert empty strings for optional FKs to null
    const payload: Partial<ApiProduct> = {
      ...formData,
      slug: finalSlug,
      brandId: formData.brandId || null,
      categoryId: formData.categoryId || null,
      description: formData.description || null,
      // Cast basePrice explicitly to number to guarantee correct type
      basePrice: Number(formData.basePrice),
    } as Partial<ApiProduct>;

    try {
      setIsSaving(true);
      await onSave(payload);
    } catch (err) {
      console.error('ProductEditor submit error:', err);
      // Error toasting is handled by the parent page
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
              {isEditing ? 'Edit Asset Specs' : 'New Asset Specs'}
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              {isEditing ? `ID: ${product?.id}` : 'Initialize system parameters'}
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
              {/* Name */}
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

              {/* Brand + Category */}
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

              {/* Slug + Price + Status */}
              <div className="grid grid-cols-2 gap-4">
                {/* Slug */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between ml-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      Slug
                    </label>
                    {isSlugManual && (
                      <button
                        type="button"
                        onClick={resetSlugToAuto}
                        className="text-[9px] text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
                        title="Reset to auto-generate from name"
                      >
                        <Wand2 size={10} />
                        auto
                      </button>
                    )}
                    {!isSlugManual && (
                      <span className="text-[9px] text-zinc-600 italic">auto</span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="auto-generated-from-name"
                    className={`w-full px-4 py-3 bg-black border rounded-xl text-white outline-none focus:border-primary transition-all font-mono text-[10px] ${
                      isSlugManual ? 'border-primary/40' : 'border-white/10'
                    }`}
                    value={formData.slug}
                    onChange={(e) => handleSlugChange(e.target.value)}
                  />
                </div>

                {/* Base Price */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Base Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all"
                    value={formData.basePrice || ''}
                    onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                  />
                </div>

                {/* Status */}
                <div className="space-y-2 col-span-2">
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

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">System Description</label>
                <textarea
                  placeholder="Detailed asset specifications..."
                  className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary min-h-[150px] transition-all resize-none"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </div>

            {/* Images Panel */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Visual Assets</label>
                {isEditing && product?.id ? (
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
            disabled={isSaving}
            className="px-6 py-3 bg-white/5 text-white text-xs font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-widest disabled:opacity-50"
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
