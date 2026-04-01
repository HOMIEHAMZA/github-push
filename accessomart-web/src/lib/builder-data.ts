export type PCComponentCategory = 'CPU' | 'Motherboard' | 'GPU' | 'RAM' | 'Storage' | 'Power Supply' | 'Case' | 'Cooling';

export interface PCComponent {
  id: string;
  name: string;
  brand: string;
  category: PCComponentCategory;
  price: number;
  imageUrl: string;
  specifications: { label: string; value: string }[];
  technicalData: {
    socket?: string;
    ramType?: 'DDR4' | 'DDR5';
    tdp?: number; // Watts used (CPU/GPU)
    wattage?: number; // Watts provided (PSU)
    slots?: number; // RAM slots needed
  };
}

export const builderCategories: PCComponentCategory[] = [
  'CPU', 'Motherboard', 'GPU', 'RAM', 'Storage', 'Power Supply', 'Case', 'Cooling'
];

export const builderComponents: PCComponent[] = [
  // CPUs
  {
    id: 'cpu-1',
    name: 'Intel Core i9-14900K',
    brand: 'Intel',
    category: 'CPU',
    price: 589.00,
    imageUrl: '/images/components/cpu-intel.png',
    specifications: [{ label: 'Cores', value: '24 (8P + 16E)' }, { label: 'Freq', value: '6.0GHz Max' }],
    technicalData: { socket: 'LGA1700', tdp: 125 }
  },
  {
    id: 'cpu-2',
    name: 'AMD Ryzen 9 7950X',
    brand: 'AMD',
    category: 'CPU',
    price: 529.00,
    imageUrl: '/images/components/cpu-amd.png',
    specifications: [{ label: 'Cores', value: '16' }, { label: 'Freq', value: '5.7GHz Max' }],
    technicalData: { socket: 'AM5', tdp: 170 }
  },
  // Motherboards
  {
    id: 'mobo-1',
    name: 'ROG Maximus Z790 Hero',
    brand: 'ASUS',
    category: 'Motherboard',
    price: 629.00,
    imageUrl: '/images/components/mobo-intel.png',
    specifications: [{ label: 'Chipset', value: 'Z790' }, { label: 'Form', value: 'ATX' }],
    technicalData: { socket: 'LGA1700', ramType: 'DDR5' }
  },
  {
    id: 'mobo-2',
    name: 'X670E AORUS MASTER',
    brand: 'GIGABYTE',
    category: 'Motherboard',
    price: 489.00,
    imageUrl: '/images/components/mobo-amd.png',
    specifications: [{ label: 'Chipset', value: 'X670E' }, { label: 'Form', value: 'ATX' }],
    technicalData: { socket: 'AM5', ramType: 'DDR5' }
  },
  // GPUs
  {
    id: 'gpu-1',
    name: 'NVIDIA RTX 4090 OC',
    brand: 'ASUS ROG',
    category: 'GPU',
    price: 1999.00,
    imageUrl: '/images/components/gpu-4090.png',
    specifications: [{ label: 'VRAM', value: '24GB GDDR6X' }, { label: 'Cores', value: '16384 CUDA' }],
    technicalData: { tdp: 450 }
  },
  {
    id: 'gpu-2',
    name: 'AMD Radeon RX 7900 XTX',
    brand: 'Sapphire',
    category: 'GPU',
    price: 949.00,
    imageUrl: '/images/components/gpu-7900.png',
    specifications: [{ label: 'VRAM', value: '24GB GDDR6' }, { label: 'Bus', value: '384-bit' }],
    technicalData: { tdp: 355 }
  },
  // RAM
  {
    id: 'ram-1',
    name: 'Dominator Titanium 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 189.00,
    imageUrl: '/images/components/ram-ddr5.png',
    specifications: [{ label: 'Speed', value: '6400MHz' }, { label: 'Latency', value: 'CL32' }],
    technicalData: { ramType: 'DDR5' }
  },
  {
    id: 'ram-2',
    name: 'Vengeance RGB 32GB',
    brand: 'Corsair',
    category: 'RAM',
    price: 99.00,
    imageUrl: '/images/components/ram-ddr4.png',
    specifications: [{ label: 'Speed', value: '3600MHz' }, { label: 'Latency', value: 'CL18' }],
    technicalData: { ramType: 'DDR4' }
  },
  // Storage
  {
    id: 'ssd-1',
    name: '990 PRO 2TB NVMe',
    brand: 'Samsung',
    category: 'Storage',
    price: 179.00,
    imageUrl: '/images/components/ssd.png',
    specifications: [{ label: 'Seq. Read', value: '7450 MB/s' }, { label: 'Gen', value: 'PCIe 4.0' }],
    technicalData: {}
  },
  // PSU
  {
    id: 'psu-1',
    name: 'HX1200i Platinum',
    brand: 'Corsair',
    category: 'Power Supply',
    price: 289.00,
    imageUrl: '/images/components/psu.png',
    specifications: [{ label: 'Efficiency', value: '80+ Platinum' }, { label: 'Modular', value: 'Full' }],
    technicalData: { wattage: 1200 }
  },
  {
    id: 'psu-2',
    name: 'SF750 Gold',
    brand: 'Corsair',
    category: 'Power Supply',
    price: 169.00,
    imageUrl: '/images/components/psu-sf.png',
    specifications: [{ label: 'Form Factor', value: 'SFX' }, { label: 'Modular', value: 'Full' }],
    technicalData: { wattage: 750 }
  },
  // Case
  {
    id: 'case-1',
    name: 'O11 Dynamic EVO',
    brand: 'Lian Li',
    category: 'Case',
    price: 169.00,
    imageUrl: '/images/components/case.png',
    specifications: [{ label: 'Type', value: 'Mid Tower' }, { label: 'Color', value: 'Obsidian Black' }],
    technicalData: {}
  },
  // Cooling
  {
    id: 'cool-1',
    name: 'Kraken Elite 360 RGB',
    brand: 'NZXT',
    category: 'Cooling',
    price: 279.00,
    imageUrl: '/images/components/cooling.png',
    specifications: [{ label: 'Size', value: '360mm' }, { label: 'Display', value: 'LCD' }],
    technicalData: {}
  }
];
