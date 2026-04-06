'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Reorder } from 'framer-motion';
import { Upload, X, Trash2, Star, Loader2, GripVertical } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { adminApi } from '@/lib/api-client';
import { ApiProductImage } from '@/lib/api-types';
import Image from 'next/image';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ImageUploaderProps {
  productId: string;
  images: ApiProductImage[];
  onImagesChange: (images: ApiProductImage[]) => void;
}

export function ImageUploader({ productId, images, onImagesChange }: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep a snapshot of the pre-drag order so we can revert on error
  const previousOrder = useRef<ApiProductImage[]>(images);

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    if (images.length + files.length > 10) {
      setError('Maximum 10 images allowed per product');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const fileArray = Array.from(files);
      const res = await adminApi.uploadImages(productId, fileArray);
      onImagesChange(res.images);
    } catch (err: unknown) {
      console.error('Upload error details:', err);
      const e = err as { details?: Array<{ message: string }>; error?: string; message?: string };
      const errorMessage =
        e?.details?.[0]?.message ||
        e?.error ||
        e?.message ||
        'Failed to upload images';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  }, [productId, images, onImagesChange]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const removeImage = async (imageId: string) => {
    try {
      await adminApi.deleteImage(productId, imageId);
      onImagesChange(images.filter(img => img.id !== imageId));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete image';
      setError(errorMessage);
    }
  };

  const setPrimary = async (imageId: string) => {
    try {
      await adminApi.setPrimaryImage(productId, imageId);
      onImagesChange(images.map(img => ({
        ...img,
        isPrimary: img.id === imageId
      })));
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to set primary image';
      setError(errorMessage);
    }
  };

  // Serialization refs to prevent overlapping parallel transactions (deadlock 40P01)
  const isReordering = useRef(false);
  const pendingOrder = useRef<ApiProductImage[] | null>(null);

  // handleReorder is called by framer-motion on every intermediate frame.
  // We ONLY update local state for fluid visual feedback.
  const handleReorder = (newOrder: ApiProductImage[]) => {
    onImagesChange(newOrder);
  };

  /**
   * Syncs the current gallery state to the backend.
   * Triggered only on drag end to minimize server load and eliminate jitter.
   */
  const handleDragEnd = async () => {
    // If a sync is already active, queue this final layout to run once it finishes.
    if (isReordering.current) {
      pendingOrder.current = [...images];
      return;
    }

    await executeSerializedReorder([...images]);
  };

  /**
   * Helper to perform serialized reorder with exponential backoff retry for deadlocks.
   * Only fires once per completed drag action.
   */
  const executeSerializedReorder = async (orderToSave: ApiProductImage[]) => {
    isReordering.current = true;
    setError(null);

    const maxRetries = 3;
    let attempt = 0;
    let success = false;

    while (attempt < maxRetries && !success) {
      try {
        const imageIds = orderToSave.map(img => img.id);
        await adminApi.reorderProductImages(productId, imageIds);
        success = true;
        // Update snapshot after successful save
        previousOrder.current = orderToSave;
      } catch (err: any) {
        attempt++;
        const isDeadlock = err?.error?.includes('40P01') || err?.message?.includes('deadlock');
        
        if (isDeadlock && attempt < maxRetries) {
          // Wait before retry (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 300 * attempt));
          continue;
        }

        console.error('Reorder save failed after retries:', err);
        setError('Failed to save image order — changes reverted');
        // Revert UI to the last known good state if even retries fail
        onImagesChange(previousOrder.current);
        success = true; 
      }
    }

    isReordering.current = false;

    // If another drag finished and queued while this was running, process the final state now.
    if (pendingOrder.current) {
      const nextOrder = pendingOrder.current;
      pendingOrder.current = null;
      await executeSerializedReorder(nextOrder);
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={cn(
          "relative group cursor-pointer border-2 border-dashed rounded-xl p-8 transition-all duration-300",
          "bg-slate-900/50 backdrop-blur-sm",
          isDragging
            ? "border-cyan-500 shadow-[0_0_20px_rgba(6,182,212,0.3)] bg-cyan-500/5"
            : "border-slate-700 hover:border-slate-500"
        )}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <input
          id="file-upload"
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
          disabled={isUploading}
          title="File Selection"
        />

        <div className="flex flex-col items-center justify-center text-center">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin mb-4" />
          ) : (
            <div className={cn(
              "w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110",
              isDragging && "bg-cyan-500/20 text-cyan-400"
            )}>
              <Upload className="w-8 h-8 text-slate-400 group-hover:text-cyan-400" />
            </div>
          )}
          <h3 className="text-lg font-semibold text-slate-100 mb-1">
            {isUploading ? 'Uploading Circuitry...' : 'Upload Component Images'}
          </h3>
          <p className="text-sm text-slate-400 max-w-xs mb-4">
            Drag files here or click to upload. Drag thumbnails below to reorder. (Max 10 images)
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="ml-auto hover:text-red-300 transition-colors" title="Dismiss error">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Gallery Grid with Drag-to-Reorder */}
      {images.length > 0 && (
        <>
          <p className="text-[10px] text-zinc-500 uppercase tracking-widest px-1">
            Drag thumbnails to reorder · Hover for controls
          </p>
          <Reorder.Group
            axis="x"
            values={images}
            onReorder={handleReorder}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {images.map((image) => (
              <Reorder.Item
                key={image.id}
                value={image}
                onDragEnd={handleDragEnd}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden border transition-all duration-300 cursor-grab active:cursor-grabbing select-none",
                  image.isPrimary
                    ? "border-cyan-500 ring-2 ring-cyan-500/20"
                    : "border-slate-700 hover:border-cyan-500/50"
                )}
                whileDrag={{ scale: 1.05, zIndex: 10, boxShadow: "0 20px 40px rgba(0,0,0,0.5)" }}
              >
                <Image
                  src={image.url}
                  alt={image.altText || 'Product visual asset'}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  className="object-cover pointer-events-none"
                  draggable={false}
                />

                {/* Grip Icon */}
                <div className="absolute top-1.5 right-1.5 p-1 rounded bg-black/50 backdrop-blur text-white/60 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-3.5 h-3.5" />
                </div>

                {/* Primary Badge */}
                {image.isPrimary && (
                  <div className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-cyan-500 text-slate-900 text-[9px] font-bold uppercase tracking-wider shadow">
                    Primary
                  </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                  {!image.isPrimary && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setPrimary(image.id); }}
                      className="p-2 rounded-full bg-slate-800/90 text-slate-200 hover:bg-cyan-500 hover:text-slate-900 transition-all hover:scale-110"
                      title="Set as Primary"
                    >
                      <Star className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                    className="p-2 rounded-full bg-slate-800/90 text-slate-200 hover:bg-red-500 transition-all hover:scale-110"
                    title="Remove Image"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </>
      )}
    </div>
  );
}
