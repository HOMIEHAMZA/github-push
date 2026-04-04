'use client';

import { useEffect, useState } from 'react';
import { builderApi } from '@/lib/api-client';
import { ApiPCBuild, ApiPCBuildItem } from '@/lib/api-types';
import { 
  Zap, 
  Trash2, 
  Loader2, 
  AlertCircle,
  Database,
  Terminal,
  ExternalLink,
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function BuildsPage() {
  const [builds, setBuilds] = useState<ApiPCBuild[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBuilds = async () => {
    setIsLoading(true);
    try {
      const { builds } = await builderApi.getMyBuilds();
      setBuilds(builds);
    } catch (err) {
      console.error('Failed to fetch builds', err);
      setError(err instanceof Error ? err.message : 'Calibration error: Could not retrieve hangar assets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBuilds();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to scrap this build? All technical data will be purged.')) return;
    try {
      await builderApi.delete(id);
      setBuilds(builds.filter(b => b.id !== id));
    } catch (err) {
      alert('Decommissioning failed: ' + (err instanceof Error ? err.message : 'Unknown error'));
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-white to-[#00f2ff] uppercase tracking-tight">
            Terminal Hangar
          </h1>
          <p className="mt-2 text-white/40 uppercase tracking-widest text-xs font-bold">
            ARCHIVED LOADOUTS & EXPERIMENTAL RIGS
          </p>
        </div>
        <Link 
          href="/pc-builder"
          className="inline-flex items-center gap-2 bg-[#00f2ff]/10 border border-[#00f2ff]/20 text-[#00f2ff] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#00f2ff]/20 transition-all"
        >
          <Plus size={16} />
          New Configuration
        </Link>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Loader2 className="w-12 h-12 text-[#00f2ff] animate-spin" strokeWidth={1} />
          <p className="text-[#00f2ff]/50 text-[10px] font-bold uppercase tracking-[0.3em]">Querying Hangar Status...</p>
        </div>
      ) : error ? (
        <div className="p-8 rounded-2xl bg-red-500/5 border border-red-500/10 flex flex-col items-center text-center space-y-4">
          <AlertCircle size={40} className="text-red-500/50" />
          <div className="space-y-1">
            <p className="text-red-500 font-bold uppercase tracking-widest text-sm">System Malfunction</p>
            <p className="text-xs text-white/40">{error}</p>
          </div>
          <button 
            onClick={fetchBuilds}
            className="px-6 py-2 bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-red-500/30 transition-all"
          >
            Re-sync Hangar
          </button>
        </div>
      ) : builds.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {builds.map((build) => (
            <div 
              key={build.id} 
              className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-[#00f2ff]/30 transition-all duration-500"
            >
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-scanlines opacity-[0.03] pointer-events-none" />
              
              <div className="p-6 space-y-6">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-lg font-bold text-white uppercase tracking-tight group-hover:text-[#00f2ff] transition-colors">
                      {build.name}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-white/40 font-bold tracking-widest uppercase">
                      <Terminal size={12} />
                      Ref: {build.id.slice(0, 8)}
                    </div>
                  </div>
                  <span className="text-lg font-bold text-[#00f2ff] font-mono">
                    ${Number(build.totalPrice).toFixed(2)}
                  </span>
                </div>

                {/* Build Manifest Snapshot */}
                <div className="space-y-2 py-4 border-y border-white/5">
                  {build.items?.slice(0, 3).map((item: ApiPCBuildItem, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-[10px]">
                      <span className="text-white/40 uppercase font-bold tracking-widest">{item.category}</span>
                      <span className="text-white/80 font-medium truncate ml-4 max-w-[150px]">
                        {item.variant?.product?.name || 'Loading Asset...'}
                      </span>
                    </div>
                  ))}
                  {build.items?.length > 3 && (
                    <p className="text-[9px] text-[#00f2ff]/50 font-bold uppercase tracking-widest pt-1">
                      + {build.items.length - 3} Additional Modules
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2">
                   <div className="flex items-center gap-2">
                     <div className="w-2 h-2 rounded-full bg-emerald-500/50 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                     <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Active State</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <button 
                       onClick={() => handleDelete(build.id)}
                       className="p-2.5 rounded-xl bg-white/5 text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all border border-transparent hover:border-red-400/20"
                       title="Decommission Build"
                     >
                       <Trash2 size={16} />
                     </button>
                     <button 
                       className="flex items-center gap-2 bg-[#00f2ff] text-black px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:shadow-[0_0_20px_rgba(0,242,255,0.4)] transition-all"
                     >
                       DEPLOY
                       <ExternalLink size={14} />
                     </button>
                   </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 bg-[#111] border border-white/5 rounded-3xl border-dashed flex flex-col items-center justify-center text-center space-y-6">
          <div className="relative">
            <Database className="w-16 h-16 text-white/5" />
            <Zap className="absolute -top-2 -right-2 text-[#00f2ff]/20 animate-pulse" size={24} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-bold text-white uppercase tracking-tight">Hangar is Vacant</p>
            <p className="text-xs text-white/40 max-w-xs mx-auto font-medium uppercase tracking-wider leading-relaxed">
              No experimental rigs identified in your primary database. Begin your first configuration sequence.
            </p>
          </div>
          <Link 
            href="/pc-builder" 
            className="px-8 py-3 bg-[#00f2ff] text-black font-bold rounded-xl hover:shadow-[0_0_30px_rgba(0,242,255,0.3)] transition-all uppercase text-xs tracking-widest"
          >
            Start Build Sequence
          </Link>
        </div>
      )}
    </div>
  );
}
