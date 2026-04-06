'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, X, Save, Wand2, Plus } from 'lucide-react';
import { ApiProduct, ApiBrand, ApiCategory, ApiProductImage } from '@/lib/api-types';
import { ImageUploader } from './ImageUploader';
import { adminApi } from '@/lib/api-client';
import { cn } from '@/lib/utils';

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
    basePrice: Number(product?.basePrice || 0),
    description: product?.description || '',
    shortDesc: product?.shortDesc || '',
    status: product?.status || 'DRAFT',
    images: product?.images || [] as ApiProductImage[],
    specs: product?.specs || [] as any[],
    variants: product?.variants || [] as any[],
  });

  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'specs' | 'variants' | 'images'>('basic');
  const [isSlugManual, setIsSlugManual] = useState(isEditing && !!product?.slug);

  // Re-sync when the product prop changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        slug: product.slug || '',
        brandId: product.brand?.id || '',
        categoryId: product.category?.id || '',
        basePrice: Number(product.basePrice || 0),
        description: product.description || '',
        shortDesc: product.shortDesc || '',
        status: product.status || 'DRAFT',
        images: product.images || [],
        specs: product.specs || [],
        variants: product.variants || [],
      });
      setIsSlugManual(!!(product.id && product.slug));
    }
  }, [product]);

  // Fetch full details
  useEffect(() => {
    if (!isEditing || !product?.id) return;

    let cancelled = false;
    adminApi.getProduct(product.id).then(res => {
      if (cancelled) return;
      if (res.product) {
        setFormData(prev => ({
          ...prev,
          images: res.product.images || prev.images,
          specs: res.product.specs || prev.specs,
          variants: res.product.variants || prev.variants,
        }));
      }
    }).catch(err => {
      console.warn('Could not fetch full product details:', err);
    });

    return () => { cancelled = true; };
  }, [product?.id]);

  const handleUpdateImages = useCallback((newImages: ApiProductImage[]) => {
    setFormData(prev => ({ ...prev, images: newImages }));
  }, []);

  const handleNameChange = (name: string) => {
    setFormData(prev => {
      const next = { ...prev, name };
      if (!isSlugManual) {
        next.slug = slugify(name);
      }
      return next;
    });
  };

  const handleSlugChange = (slug: string) => {
    setFormData(prev => ({ ...prev, slug }));
    setIsSlugManual(true);
  };

  const resetSlugToAuto = () => {
    setIsSlugManual(false);
    setFormData(prev => ({ ...prev, slug: slugify(prev.name) }));
  };

  const handleAddSpec = () => {
    setFormData(prev => ({
      ...prev,
      specs: [...prev.specs, { groupName: '', specKey: '', specValue: '', sortOrder: prev.specs.length }]
    }));
  };

  const handleRemoveSpec = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specs: prev.specs.filter((_, i) => i !== index)
    }));
  };

  const handleSpecChange = (index: number, field: string, value: string) => {
    setFormData(prev => {
      const nextSpecs = [...prev.specs];
      nextSpecs[index] = { ...nextSpecs[index], [field]: value };
      return { ...prev, specs: nextSpecs };
    });
  };

  const handleVariantAttrChange = (variantIndex: number, key: string, value: string) => {
    setFormData(prev => {
      const nextVariants = [...prev.variants];
      const nextAttrs = { ...nextVariants[variantIndex].attributes, [key]: value };
      nextVariants[variantIndex] = { ...nextVariants[variantIndex], attributes: nextAttrs };
      return { ...prev, variants: nextVariants };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) return;
    if (!formData.basePrice || formData.basePrice <= 0) return;

    const finalSlug = formData.slug.trim() || slugify(formData.name);

    // Filter out blank specs where key or value is missing or whitespace
    const filteredSpecs = (formData.specs || []).filter(
      (spec: any) => spec.specKey?.trim() && spec.specValue?.trim()
    );

    const payload: any = {
      ...formData,
      slug: finalSlug,
      brandId: formData.brandId || null,
      categoryId: formData.categoryId || null,
      description: formData.description || null,
      shortDesc: formData.shortDesc || null,
      basePrice: Number(formData.basePrice),
      specs: filteredSpecs,
    };

    try {
      setIsSaving(true);
      await onSave(payload);
    } catch (err) {
      console.error('ProductEditor submit error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-5xl bg-zinc-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
        {/* Header */}
        <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <div>
            <h2 className="text-xl font-bold text-white uppercase tracking-tight">
              {isEditing ? 'Synthesize Asset Parameters' : 'Initialize New Asset'}
            </h2>
            <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">
              {isEditing ? `CORE ID: ${product?.id}` : 'Prepare system for data ingestion'}
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

        {/* Tabs */}
        <div className="px-8 bg-black/40 border-b border-white/5 flex gap-8">
          {[
            { id: 'basic', label: 'Basic Info' },
            { id: 'specs', label: 'Technical Specs' },
            { id: 'variants', label: 'Variant Matrix' },
            { id: 'images', label: 'Visual Assets' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all border-b-2",
                activeTab === tab.id ? "text-primary border-primary" : "text-zinc-500 border-transparent hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <form id="product-form" onSubmit={handleSubmit}>
            {activeTab === 'basic' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
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

                  {/* Slug + Price */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between ml-1">
                        <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Slug</label>
                        {isSlugManual ? (
                          <button
                            type="button"
                            onClick={resetSlugToAuto}
                            className="text-[9px] text-primary hover:text-primary-light flex items-center gap-1 transition-colors"
                          >
                            <Wand2 size={10} />
                            auto
                          </button>
                        ) : (
                          <span className="text-[9px] text-zinc-600 italic">auto</span>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="auto-generated"
                        className={cn(
                          "w-full px-4 py-3 bg-black border rounded-xl text-white outline-none focus:border-primary transition-all font-mono text-[10px]",
                          isSlugManual ? "border-primary/40" : "border-white/10"
                        )}
                        value={formData.slug}
                        onChange={(e) => handleSlugChange(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Base Price ($) *</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        required
                        className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all"
                        value={formData.basePrice || ''}
                        onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Terminal Status</label>
                    <select
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all appearance-none"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    >
                      <option value="DRAFT">DRAFT</option>
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="ARCHIVED">ARCHIVED</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Short Desc */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Short Protocol Abstract</label>
                    <textarea
                      placeholder="High-level summary (1-2 sentences)..."
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary min-h-[80px] transition-all resize-none"
                      value={formData.shortDesc}
                      onChange={(e) => setFormData({ ...formData, shortDesc: e.target.value })}
                    />
                  </div>

                  {/* Main Description */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Full System Documentation</label>
                    <textarea
                      placeholder="Detailed asset specifications and documentation..."
                      className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary min-h-[180px] transition-all resize-none"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Technical Parameter Map</h3>
                  <button
                    type="button"
                    onClick={handleAddSpec}
                    className="text-[10px] font-bold text-primary flex items-center gap-2 hover:bg-primary/10 px-4 py-2 rounded-lg transition-all"
                  >
                    <Plus size={14} />
                    ADD PARAMETER
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.specs.length === 0 && (
                    <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
                      <p className="text-xs uppercase tracking-widest">No parameters defined</p>
                    </div>
                  )}
                  {formData.specs.map((spec, idx) => (
                    <div key={idx} className="flex gap-4 p-4 bg-black/40 border border-white/5 rounded-2xl group">
                      <div className="grid grid-cols-3 gap-4 flex-1">
                        <input
                          placeholder="Group (e.g. Display)"
                          className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary"
                          value={spec.groupName || ''}
                          onChange={(e) => handleSpecChange(idx, 'groupName', e.target.value)}
                        />
                        <input
                          placeholder="Key (e.g. Resolution)"
                          className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary"
                          value={spec.specKey}
                          onChange={(e) => handleSpecChange(idx, 'specKey', e.target.value)}
                        />
                        <input
                          placeholder="Value (e.g. 4K OLED)"
                          className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary"
                          value={spec.specValue}
                          onChange={(e) => handleSpecChange(idx, 'specValue', e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveSpec(idx)}
                        className="p-2 text-zinc-600 hover:text-red-500 transition-colors"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'variants' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-tight">Variant Identity Matrix</h3>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Configure attributes for unique SKUs</p>
                </div>

                <div className="space-y-6">
                  {!isEditing ? (
                    <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-zinc-500">
                      <p className="text-xs uppercase tracking-widest">Matrix initialization available after save</p>
                    </div>
                  ) : formData.variants.map((v, idx) => (
                    <div key={v.id} className="p-6 bg-black/40 border border-white/5 rounded-2xl space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{v.sku}</span>
                          <h4 className="text-xs font-bold text-white mt-1 uppercase">{v.name}</h4>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Current Inventory</p>
                          <p className="text-sm font-mono text-white">{v.inventory?.quantity || 0} UNITS</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-6">
                        {['Color', 'Size', 'Model'].map(attrType => (
                          <div key={attrType} className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{attrType}</label>
                            <input
                              placeholder={`e.g. ${attrType === 'Color' ? 'Obsidian' : attrType === 'Size' ? 'Full' : 'Wireless'}`}
                              className="w-full bg-black/60 border border-white/10 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-primary"
                              value={v.attributes?.[attrType.toLowerCase()] || ''}
                              onChange={(e) => handleVariantAttrChange(idx, attrType.toLowerCase(), e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'images' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest ml-1">Visual Assets</label>
                  {isEditing && product?.id ? (
                    <ImageUploader
                      productId={product.id}
                      images={formData.images}
                      onImagesChange={handleUpdateImages}
                    />
                  ) : (
                    <div className="p-12 border-2 border-dashed border-white/5 rounded-3xl bg-black/40 flex flex-col items-center justify-center text-center">
                      <p className="text-sm text-zinc-500 uppercase tracking-widest">Visual data ingestion available after asset initialization.</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-white/10 bg-white/5 flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="px-6 py-3 bg-white/5 text-white text-[10px] font-bold rounded-xl hover:bg-white/10 transition-all uppercase tracking-[0.2em] disabled:opacity-50"
          >
            Abort Sync
          </button>
          <button
            form="product-form"
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-3 px-10 py-3 bg-primary text-black text-[10px] font-bold rounded-xl hover:bg-primary-light transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-[0.2em]"
          >
            {isSaving ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                <span>Synchronizing...</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>Deploy Updates</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
