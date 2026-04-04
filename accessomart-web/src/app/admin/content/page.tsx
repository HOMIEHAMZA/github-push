'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminStore } from '@/store/useAdminStore';
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Monitor, 
  Cpu,
  Layout,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ContentManager() {
  const { 
    homepageLayout, 
    pcBuilderSettings, 
    toggleSection, 
    updatePCBuilder,
    reorderSections 
  } = useAdminStore();

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const newLayout = [...homepageLayout];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newLayout.length) return;
    
    [newLayout[index], newLayout[targetIndex]] = [newLayout[targetIndex], newLayout[index]];
    reorderSections(newLayout);
  };

  return (
    <AdminLayout activeItem="Content CMS">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
        {/* Homepage Sections */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3 text-white mb-6">
            <Layout className="text-primary" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Homepage Structure</h2>
          </div>
          
          <div className="space-y-4">
            {homepageLayout.map((section, index) => (
              <div 
                key={section.id}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl bg-white/5 border transition-all duration-300",
                  section.isEnabled ? "border-white/10" : "border-red-500/20 opacity-50 grayscale"
                )}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <button 
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"
                      title="Move section up"
                    >
                      <GripVertical size={14} className="rotate-0" />
                    </button>
                    <button 
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === homepageLayout.length - 1}
                      className="text-zinc-600 hover:text-white disabled:opacity-0 transition-colors"
                      title="Move section down"
                    >
                      <GripVertical size={14} className="rotate-0" />
                    </button>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white uppercase tracking-widest">{section.id}</h4>
                    <p className="text-[10px] text-zinc-500 uppercase">Section Control</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => toggleSection(section.id)}
                    className={cn(
                      "flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                      section.isEnabled 
                        ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20" 
                        : "bg-zinc-800 text-zinc-500 border-zinc-700 hover:text-white"
                    )}
                  >
                    {section.isEnabled ? (
                      <>
                        <Eye size={14} />
                        <span>VISIBLE</span>
                      </>
                    ) : (
                      <>
                        <EyeOff size={14} />
                        <span>HIDDEN</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Toggles */}
        <div className="space-y-8">
          <div className="flex items-center space-x-3 text-white mb-6">
            <Settings className="text-tertiary" size={24} />
            <h2 className="text-xl font-bold uppercase tracking-tight">Feature Engines</h2>
          </div>

          <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-8">
            {/* PC Builder Toggle */}
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-tertiary/10 border border-tertiary/20 flex items-center justify-center text-tertiary">
                  <Cpu size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1 uppercase tracking-tight">Custom PC Builder</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-[280px]">
                    Enable the advanced modular configurator with technical validation logic.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => updatePCBuilder({ enabled: !pcBuilderSettings.enabled })}
                className={cn(
                  "relative w-14 h-7 rounded-full transition-colors duration-300",
                  pcBuilderSettings.enabled ? "bg-tertiary" : "bg-zinc-800"
                )}
                title={pcBuilderSettings.enabled ? "Disable PC Builder" : "Enable PC Builder"}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300",
                  pcBuilderSettings.enabled ? "translate-x-7" : "translate-x-0"
                )} />
              </button>
            </div>

            <div className="h-px bg-white/5" />

            {/* Nav Visibility Toggle */}
            <div className="flex items-start justify-between">
              <div className="flex space-x-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                  <Monitor size={24} strokeWidth={1.5} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white mb-1 uppercase tracking-tight">Nav Integration</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed max-w-[280px]">
                    Control the visibility of the &quot;Builder&quot; terminal in the global navigation bar.
                  </p>
                </div>
              </div>
              
              <button 
                onClick={() => updatePCBuilder({ showInNav: !pcBuilderSettings.showInNav })}
                className={cn(
                  "relative w-14 h-7 rounded-full transition-colors duration-300",
                  pcBuilderSettings.showInNav ? "bg-primary" : "bg-zinc-800"
                )}
                title={pcBuilderSettings.showInNav ? "Hide from Navigation" : "Show in Navigation"}
              >
                <div className={cn(
                  "absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform duration-300",
                  pcBuilderSettings.showInNav ? "translate-x-7" : "translate-x-0"
                )} />
              </button>
            </div>
          </div>

          <div className="p-8 rounded-3xl bg-secondary/5 border border-secondary/20">
            <h3 className="text-sm font-bold text-secondary text-center uppercase tracking-[0.2em] mb-4">Preview Engine</h3>
            <p className="text-xs text-zinc-500 text-center leading-relaxed">
              Real-time synchronization active. Changes made here are immediately applied to the storefront cache.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
