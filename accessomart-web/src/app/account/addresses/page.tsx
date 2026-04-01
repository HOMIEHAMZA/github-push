'use client';

import { useEffect, useState } from 'react';
import { useAddressStore } from '@/store/useAddressStore';
import { 
  MapPin, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X,
  CreditCard,
  Home,
  Briefcase,
  MoreVertical
} from 'lucide-react';
import { ApiAddress } from '@/lib/api-types';

export default function AddressesPage() {
  const { addresses, isLoading, fetchAddresses, addAddress, updateAddress, deleteAddress } = useAddressStore();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const [formData, setFormData] = useState<Partial<ApiAddress>>({
    label: 'Home',
    firstName: '',
    lastName: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    isDefault: false,
    phone: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await updateAddress(editingId, formData);
    } else {
      await addAddress(formData);
    }
    setShowForm(false);
    setEditingId(null);
    setFormData({ label: 'Home', firstName: '', lastName: '', line1: '', line2: '', city: '', state: '', postalCode: '', country: 'US', isDefault: false, phone: '' });
  };

  const startEdit = (address: ApiAddress) => {
    setFormData(address);
    setEditingId(address.id);
    setShowForm(true);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-[#00f2ff]">
            Saved Addresses
          </h1>
          <p className="mt-2 text-white/40">
            Manage your shipping destinations for faster checkout.
          </p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-[#00f2ff] text-black font-bold rounded-xl hover:scale-105 active:scale-95 transition-all"
        >
          {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showForm ? 'Cancel' : 'Add New Address'}</span>
        </button>
      </div>

      {/* Address Form */}
      {showForm && (
        <div className="bg-[#111] border border-[#00f2ff]/30 rounded-2xl p-6 animate-in fade-in zoom-in duration-300">
          <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
            {editingId ? <Edit3 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingId ? 'Edit Address' : 'New Delivery Address'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Address Label</label>
              <select 
                value={formData.label}
                onChange={(e) => setFormData({...formData, label: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none"
              >
                <option value="Home">Home</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">First Name</label>
                <input required type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Last Name</label>
                <input required type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40">Street Address</label>
              <input required type="text" placeholder="House number and street name" value={formData.line1} onChange={(e) => setFormData({...formData, line1: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              <input type="text" placeholder="Apartment, suite, unit, etc. (optional)" value={formData.line2} onChange={(e) => setFormData({...formData, line2: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">City</label>
                <input required type="text" value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">State / Province</label>
                <input required type="text" value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Postal Code</label>
                <input required type="text" value={formData.postalCode} onChange={(e) => setFormData({...formData, postalCode: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40">Phone</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-[#00f2ff]/50 outline-none" />
              </div>
            </div>
            <div className="md:col-span-2 flex items-center space-x-3">
              <input 
                id="default" 
                type="checkbox" 
                checked={formData.isDefault}
                onChange={(e) => setFormData({...formData, isDefault: e.target.checked})}
                className="w-4 h-4 rounded border-white/10 bg-white/5 text-[#00f2ff]" 
              />
              <label htmlFor="default" className="text-sm text-white/60">Set as default shipping address</label>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-4 pt-4 border-t border-white/5">
              <button 
                type="button" 
                onClick={() => { setShowForm(false); setEditingId(null); }}
                className="px-6 py-2 text-sm font-bold text-white/40 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-8 py-2 bg-[#00f2ff] text-black font-bold rounded-lg hover:bg-white transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Saving...' : editingId ? 'Update Address' : 'Save Address'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Address Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading && !showForm ? (
          [1, 2].map((i) => (
            <div key={i} className="h-48 bg-[#111] animate-pulse rounded-2xl"></div>
          ))
        ) : addresses.length > 0 ? (
          addresses.map((address) => (
            <div key={address.id} className={`group p-6 bg-[#111] border rounded-2xl transition-all ${address.isDefault ? 'border-[#00f2ff]/30 ring-1 ring-[#00f2ff]/10' : 'border-white/5 hover:border-white/20'}`}>
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${address.isDefault ? 'bg-[#00f2ff]/10 text-[#00f2ff]' : 'bg-white/5 text-white/40'}`}>
                    {address.label === 'Home' ? <Home className="w-5 h-5" /> : address.label === 'Office' ? <Briefcase className="w-5 h-5" /> : <MapPin className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide">{address.label}</h3>
                    {address.isDefault && (
                      <span className="text-[10px] font-bold text-[#00f2ff] uppercase tracking-widest bg-[#00f2ff]/10 px-1.5 py-0.5 rounded">Default</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => startEdit(address)}
                    className="p-2 bg-white/5 rounded-lg hover:bg-white/10 hover:text-[#00f2ff] transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => deleteAddress(address.id)}
                    className="p-2 bg-white/5 rounded-lg hover:bg-red-400/20 hover:text-red-400 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold">{address.firstName} {address.lastName}</p>
                <p className="text-sm text-white/60">{address.line1}</p>
                {address.line2 && <p className="text-sm text-white/60">{address.line2}</p>}
                <p className="text-sm text-white/60">{address.city}, {address.state} {address.postalCode}</p>
                <p className="text-sm text-white/60">{address.country}</p>
              </div>

              {address.phone && (
                <div className="mt-4 flex items-center space-x-2 text-xs text-white/40">
                  <MoreVertical className="w-3 h-3 rotate-90" />
                  <span>{address.phone}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          !showForm && (
            <div className="md:col-span-2 py-16 bg-[#111] border border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-center">
              <MapPin className="w-12 h-12 text-white/5 mb-4" />
              <p className="font-bold">No saved addresses</p>
              <p className="text-sm text-white/40 mt-1 max-w-xs">
                Add an address for a smoother and faster checkout experience.
              </p>
              <button 
                onClick={() => setShowForm(true)}
                className="mt-6 px-6 py-2 bg-white/5 border border-white/10 rounded-lg text-sm font-bold hover:border-[#00f2ff]/50 transition-all"
              >
                Add My First Address
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
