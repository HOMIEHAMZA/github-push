import { create } from 'zustand';
import { addressApi } from '@/lib/api-client';
import { ApiAddress } from '@/lib/api-types';
import { useToastStore } from './useToastStore';

interface AddressState {
  addresses: ApiAddress[];
  isLoading: boolean;
  error: string | null;

  fetchAddresses: () => Promise<void>;
  addAddress: (address: Partial<ApiAddress>) => Promise<void>;
  updateAddress: (id: string, address: Partial<ApiAddress>) => Promise<void>;
  deleteAddress: (id: string) => Promise<void>;
}

export const useAddressStore = create<AddressState>((set, get) => ({
  addresses: [],
  isLoading: false,
  error: null,

  fetchAddresses: async () => {
    set({ isLoading: true });
    try {
      const { addresses } = await addressApi.list();
      set({ addresses, isLoading: false });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  addAddress: async (data) => {
    set({ isLoading: true });
    try {
      const { address } = await addressApi.create(data);
      set((state) => ({
        addresses: data.isDefault 
          ? [address, ...state.addresses.map(a => ({ ...a, isDefault: false }))]
          : [...state.addresses, address],
        isLoading: false 
      }));
      useToastStore.getState().addToast('Address added successfully', 'success');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      useToastStore.getState().addToast(err.message, 'error');
    }
  },

  updateAddress: async (id, data) => {
    set({ isLoading: true });
    try {
      const { address } = await addressApi.update(id, data);
      set((state) => ({
        addresses: data.isDefault
          ? [address, ...state.addresses.filter(a => a.id !== id).map(a => ({ ...a, isDefault: false }))]
          : state.addresses.map((a) => (a.id === id ? address : a)),
        isLoading: false
      }));
      useToastStore.getState().addToast('Address updated successfully', 'success');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      useToastStore.getState().addToast(err.message, 'error');
    }
  },

  deleteAddress: async (id) => {
    set({ isLoading: true });
    try {
      await addressApi.delete(id);
      set((state) => ({
        addresses: state.addresses.filter((a) => a.id !== id),
        isLoading: false
      }));
      useToastStore.getState().addToast('Address removed', 'success');
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      useToastStore.getState().addToast(err.message, 'error');
    }
  },
}));
