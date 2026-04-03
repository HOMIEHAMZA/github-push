'use client';

import React, { useState, useCallback } from 'react';
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

  const handleUpload = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    // Check limit
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
      const errorMessage = (err as { details?: Array<{ message: string }>; error?: string; message?: string })?.details?.[0]?.message 
        || (err as { error?: string })?.error 
        || (err as { message?: string })?.message 
        || 'Failed to upload images';
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

  const handleReorder = async (newOrder: ApiProductImage[]) => {
    // Optimistic local update
    onImagesChange(newOrder);

    try {
      const imageIds = newOrder.map(img => img.id);
      await adminApi.reorderProductImages(productId, imageIds);
    } catch (err: unknown) {
      console.error('Reorder update failed:', err);
      setError('Failed to save image order on server');
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
            Drag and drop or click to upload. Power your product with crystal-clear visuals. (Max 10 images)
          </p>
        </div>
      </div>


      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <X className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* Gallery Grid with Reordering */}
      {images.length > 0 && (
        <Reorder.Group 
          axis="x" 
          values={images} 
          onReorder={handleReorder}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6"
        >
          {images.map((image) => (
            <Reorder.Item 
              key={image.id}
              value={image}
              className={cn(
                "group relative aspect-square rounded-lg overflow-hidden border transition-all duration-300 cursor-grab active:cursor-grabbing",
                image.isPrimary 
                  ? "border-cyan-500 ring-2 ring-cyan-500/20" 
                  : "border-slate-700 hover:border-cyan-500/50"
              )}
            >
              <Image 
                src={image.url} 
                alt={image.altText || 'Product visual asset'} 
                fill
                sizes="(max-width: 768px) 50vw, 20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105 select-none"
              />
              
              {/* Drag Handle Overlay (Visible on Hover) */}
              <div className="absolute top-2 right-2 p-1 rounded bg-black/40 backdrop-blur-md text-white/70 opacity-0 group-hover:opacity-100 transition-opacity">
                <GripVertical className="w-4 h-4" />
              </div>

              {/* Badge for Primary */}
              {image.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-cyan-500 text-slate-900 text-[10px] font-bold uppercase tracking-wider shadow-lg">
                  Primary
                </div>
              )}

              {/* Overlay Controls */}
              <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                {!image.isPrimary && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setPrimary(image.id); }}
                    className="p-2.5 rounded-full bg-slate-800/90 text-slate-200 hover:bg-cyan-500 hover:text-slate-900 transition-all transform hover:scale-110"
                    title="Set as Primary"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); removeImage(image.id); }}
                  className="p-2.5 rounded-full bg-slate-800/90 text-slate-200 hover:bg-red-500 transition-all transform hover:scale-110"
                  title="Remove Image"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}
    </div>
  );
}
