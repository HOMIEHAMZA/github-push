import { create } from 'zustand';
import { PCComponent, PCComponentCategory, builderComponents } from '@/lib/builder-data';

interface PCBuilderState {
  selections: Partial<Record<PCComponentCategory, string>>;
  activeCategory: PCComponentCategory;
  selectComponent: (category: PCComponentCategory, id: string) => void;
  removeComponent: (category: PCComponentCategory) => void;
  setActiveCategory: (category: PCComponentCategory) => void;
  clearBuild: () => void;
  getSelections: () => PCComponent[];
  getTotalPrice: () => number;
  getCompatibilityWarnings: () => string[];
}

export const usePCBuilderStore = create<PCBuilderState>((set, get) => ({
  selections: {},
  activeCategory: 'CPU',
  
  selectComponent: (category, id) => set((state) => ({
    selections: { ...state.selections, [category]: id }
  })),
  
  removeComponent: (category) => set((state) => {
    const newSelections = { ...state.selections };
    delete newSelections[category];
    return { selections: newSelections };
  }),
  
  setActiveCategory: (category) => set({ activeCategory: category }),
  
  clearBuild: () => set({ selections: {}, activeCategory: 'CPU' }),
  
  getSelections: () => {
    const { selections } = get();
    return Object.values(selections)
      .map(id => builderComponents.find(c => c.id === id))
      .filter((c): c is PCComponent => !!c);
  },
  
  getTotalPrice: () => {
    const selections = get().getSelections();
    return selections.reduce((total, c) => total + c.price, 0);
  },
  
  getCompatibilityWarnings: () => {
    const selections = get().getSelections();
    const warnings: string[] = [];
    
    const cpu = selections.find(c => c.category === 'CPU');
    const mobo = selections.find(c => c.category === 'Motherboard');
    const ram = selections.find(c => c.category === 'RAM');
    const gpu = selections.find(c => c.category === 'GPU');
    const psu = selections.find(c => c.category === 'Power Supply');
    
    // 1. Socket Check
    if (cpu && mobo && cpu.technicalData.socket !== mobo.technicalData.socket) {
      warnings.push(`Incompatible Socket: ${cpu.name} requires ${cpu.technicalData.socket}, but ${mobo.name} uses ${mobo.technicalData.socket}.`);
    }
    
    // 2. RAM Type Check
    if (ram && mobo && ram.technicalData.ramType !== mobo.technicalData.ramType) {
      warnings.push(`RAM Mismatch: ${ram.name} is ${ram.technicalData.ramType}, but ${mobo.name} requires ${mobo.technicalData.ramType}.`);
    }
    
    // 3. Wattage Check
    if (psu) {
      const cpuTdp = cpu?.technicalData.tdp || 0;
      const gpuTdp = gpu?.technicalData.tdp || 0;
      const estimatedUsage = cpuTdp + gpuTdp + 100; // 100W overhead for other components
      
      if (psu.technicalData.wattage && psu.technicalData.wattage < estimatedUsage) {
        warnings.push(`Insufficient Power: Your build estimated usage is ~${estimatedUsage}W, but ${psu.name} only provides ${psu.technicalData.wattage}W.`);
      }
    }
    
    return warnings;
  }
}));
