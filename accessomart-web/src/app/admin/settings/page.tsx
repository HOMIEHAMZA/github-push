'use client';

import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { 
  Settings, 
  Shield, 
  Globe, 
  Bell, 
  Database,
  Save,
  Cpu
} from 'lucide-react';

export default function SettingsPage() {
  return (
    <AdminLayout activeItem="Settings">
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-3xl font-display font-bold text-white uppercase tracking-tight mb-2">Core Configuration</h1>
            <p className="text-zinc-500 text-sm">Manage system-level parameters and security protocols.</p>
          </div>
          <button className="flex items-center space-x-2 px-6 py-3 bg-primary text-black font-bold rounded-2xl hover:bg-primary-light transition-all active:scale-95 shadow-[0_0_20px_rgba(50,255,126,0.3)]">
            <Save size={18} />
            <span>SAVE PROTOCOLS</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Section */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Globe size={20} />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Regional Hub</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Store Language</label>
                <select title="Store Language" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all">
                  <option>English (Universal)</option>
                  <option>Japanese (Sector 7)</option>
                  <option>German (Nexus)</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Currency Unit</label>
                <select title="Currency Unit" className="w-full px-4 py-3 bg-black border border-white/10 rounded-xl text-white outline-none focus:border-primary transition-all">
                  <option>USD ($)</option>
                  <option>EUR (€)</option>
                  <option>BTC (₿)</option>
                </select>
              </div>
            </div>
          </section>

          {/* Security Section */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Shield size={20} />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Cipher Control</h2>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Two-Factor Auth</p>
                  <p className="text-[10px] text-zinc-500">Require mobile verification for admin entry.</p>
                </div>
                <div className="w-12 h-6 bg-primary rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-black rounded-full absolute right-1" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-black/40 rounded-xl border border-white/5">
                <div>
                  <p className="text-xs font-bold text-white uppercase tracking-tight">Session Timeout</p>
                  <p className="text-[10px] text-zinc-500">Auto-lock after 30 minutes of inactivity.</p>
                </div>
                <div className="w-12 h-6 bg-zinc-800 rounded-full relative p-1 cursor-pointer">
                  <div className="w-4 h-4 bg-zinc-500 rounded-full absolute left-1" />
                </div>
              </div>
            </div>
          </section>

          {/* System Performance */}
          <section className="p-8 rounded-3xl bg-white/5 border border-white/10 col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Cpu size={20} />
              </div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">Engine Maintenance</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all">
                <Database className="text-zinc-500 mb-2" size={18} />
                <p className="text-xs font-bold text-white uppercase">Flush Cache</p>
                <p className="text-[9px] text-zinc-500">Clear temporary assets</p>
              </button>
              <button className="p-4 rounded-xl bg-white/5 border border-white/10 text-left hover:bg-white/10 transition-all">
                <Bell className="text-zinc-500 mb-2" size={18} />
                <p className="text-xs font-bold text-white uppercase">Sync Alerts</p>
                <p className="text-[9px] text-zinc-500">Refresh notification stream</p>
              </button>
              <button className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-left hover:bg-red-500/20 transition-all group">
                <Settings className="text-red-500 mb-2 group-hover:rotate-90 transition-transform" size={18} />
                <p className="text-xs font-bold text-red-500 uppercase">Panic Reset</p>
                <p className="text-[9px] text-red-400/60">Restore default protocols</p>
              </button>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}
