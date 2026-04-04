import { create } from 'zustand';
import { builderApi } from '@/lib/api-client';
import { ApiProduct, ApiCategory, ApiPCBuild } from '@/lib/api-types';

interface PCBuilderState {
  // Data
  categories: ApiCategory[];
  products: ApiProduct[]; // Flattened list for quick lookup
  
  // State
  selections: Partial<Record<string, string>>; // categoryName -> productId
  activeCategory: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchComponents: () => Promise<void>;
  selectComponent: (category: string, productId: string) => void;
  removeComponent: (category: string) => void;
  setActiveCategory: (category: string) => void;
  clearBuild: () => void;
  
  // Getters
  getSelections: () => ApiProduct[];
  getTotalPrice: () => number;
  getCompatibilityWarnings: () => string[];
  
  // Persistence
  saveBuild: (name: string) => Promise<ApiPCBuild>;
}

export const usePCBuilderStore = create<PCBuilderState>((set, get) => ({
  categories: [],
  products: [],
  selections: {},
  activeCategory: 'CPU',
  isLoading: false,
  error: null,

  fetchComponents: async () => {
    set({ isLoading: true, error: null });
    try {
      const { categories } = await builderApi.getComponents();
      // Backend returns products inside categories
      const allProducts = categories.flatMap(c => 
        (c as ApiCategory & { products: ApiProduct[] }).products || []
      );
      
      set({ 
        categories, 
        products: allProducts,
        isLoading: false,
        activeCategory: categories[0]?.name || 'CPU'
      });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to fetch hardware', isLoading: false });
    }
  },

  selectComponent: (category, productId) => set((state) => ({
    selections: { ...state.selections, [category]: productId }
  })),

  removeComponent: (category) => set((state) => {
    const newSelections = { ...state.selections };
    delete newSelections[category];
    return { selections: newSelections };
  }),

  setActiveCategory: (category) => set({ activeCategory: category }),

  clearBuild: () => set((state) => ({ 
    selections: {}, 
    activeCategory: state.categories[0]?.name || 'CPU' 
  })),

  getSelections: () => {
    const { selections, products } = get();
    return Object.values(selections)
      .map(id => products.find(p => p.id === id))
      .filter((p): p is ApiProduct => !!p);
  },

  getTotalPrice: () => {
    const selections = get().getSelections();
    return selections.reduce((total, p) => total + (Number(p.basePrice) || 0), 0);
  },

  getCompatibilityWarnings: () => {
    const selections = get().getSelections();
    const warnings: string[] = [];
    
    // Helper to find spec value safely
    const getSpec = (p: ApiProduct, key: string) => 
      p.specs?.find(s => s.specKey.toLowerCase() === key.toLowerCase())?.specValue;

    const cpu = selections.find(p => p.category?.name === 'CPU');
    const mobo = selections.find(p => p.category?.name === 'Motherboard');
    const ram = selections.find(p => p.category?.name === 'RAM');
    const gpu = selections.find(p => p.category?.name === 'GPU');
    const psu = selections.find(p => p.category?.name === 'Power Supply');
    
    // 1. Socket Check
    if (cpu && mobo) {
      const cpuSocket = getSpec(cpu, 'Socket');
      const moboSocket = getSpec(mobo, 'Socket');
      if (cpuSocket && moboSocket && cpuSocket !== moboSocket) {
        warnings.push(`Socket Conflict: ${cpu.name} (${cpuSocket}) vs ${mobo.name} (${moboSocket})`);
      }
    }
    
    // 2. RAM Type Check
    if (ram && mobo) {
      const ramType = getSpec(ram, 'Memory Type');
      const moboRamType = getSpec(mobo, 'Memory Type');
      if (ramType && moboRamType && ramType !== moboRamType) {
        warnings.push(`Memory Mismatch: ${ram.name} is ${ramType}, but ${mobo.name} requires ${moboRamType}`);
      }
    }
    
    // 3. Power Scaling
    if (psu) {
      const psuWattageStr = getSpec(psu, 'Wattage');
      const cpuTdpStr = cpu ? getSpec(cpu, 'TDP') : '0';
      const gpuTdpStr = gpu ? getSpec(gpu, 'TDP') : '0';

      const psuWattage = parseInt(psuWattageStr || '0');
      const cpuTdp = parseInt(cpuTdpStr || '0');
      const gpuTdp = parseInt(gpuTdpStr || '0');
      
      const estimate = cpuTdp + gpuTdp + 100; // Overhead
      if (psuWattage > 0 && psuWattage < estimate) {
        warnings.push(`Low Power: Build requires ~${estimate}W, but ${psu.name} provides ${psuWattage}W`);
      }
    }
    
    return warnings;
  },

  saveBuild: async (name) => {
    const selections = get().getSelections();
    const totalPrice = get().getTotalPrice();
    const warnings = get().getCompatibilityWarnings();

    const components = selections.map(p => ({
      category: p.category?.name || 'Unknown',
      productId: p.id,
      variantId: p.variants[0]?.id || '', // Default to first variant
      quantity: 1
    }));

    const { build } = await builderApi.save({
      name,
      totalPrice,
      compatibilityWarnings: warnings,
      components
    });

    return build;
  }
}));
