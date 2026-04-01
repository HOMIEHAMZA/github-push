export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  description: string;
  imageUrl: string;
  galleryUrls: string[];
  stockStatus: 'IN_STOCK' | 'LIMITED_STOCK' | 'OUT_OF_STOCK';
  isFeatured?: boolean;
  specifications: { label: string; value: string; active?: boolean }[];
  reviews: Review[];
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const products: Product[] = [
  {
    id: 'p1',
    name: 'Obsidian Ghost K1',
    brand: 'Vanguard',
    category: 'Keyboards',
    price: 219.00,
    originalPrice: 249.00,
    rating: 4.8,
    reviewCount: 124,
    description: 'The Ghost K1 features custom-tuned optical switches and a solid obsidian-matte chassis. Designed for speed, built for silence.',
    imageUrl: '/images/keyboard.png',
    galleryUrls: ['/images/keyboard.png', '/images/keyboard.png', '/images/keyboard.png'],
    stockStatus: 'IN_STOCK',
    isFeatured: true,
    specifications: [
      { label: 'Switch Type', value: 'Vanguard Linear Optical', active: true },
      { label: 'Polling Rate', value: '8000Hz Hyper-Polling' },
      { label: 'Keycaps', value: 'PBT Double-Shot (Obsidian Finish)' },
      { label: 'Connectivity', value: 'USB-C / 2.4GHz Wireless', active: true },
      { label: 'Battery Life', value: 'Up to 120 hours' }
    ],
    reviews: [
      { id: 'r1', userName: 'Alex V.', rating: 5, comment: 'Incredible response time. The finish is beautiful.', date: '2024-03-15' },
      { id: 'r2', userName: 'Sarah L.', rating: 4, comment: 'A bit heavy, but feels like military grade equipment.', date: '2024-03-10' }
    ]
  },
  {
    id: 'p2',
    name: 'SonicBlast H3',
    brand: 'AeroFlow',
    category: 'Audio',
    price: 159.00,
    rating: 4.6,
    reviewCount: 89,
    description: 'Immersive spatial audio with graphene drivers. The H3 delivers high-fidelity sound with carbon-filtered noise cancellation.',
    imageUrl: '/images/headset.png',
    galleryUrls: ['/images/headset.png', '/images/headset.png'],
    stockStatus: 'LIMITED_STOCK',
    specifications: [
      { label: 'Driver', value: '50mm Graphene', active: true },
      { label: 'Frequency Resp.', value: '10Hz - 40kHz' },
      { label: 'Microphone', value: 'ClearCast Studio' },
      { label: 'Wireless', value: 'Lossless 2.4GHz / Bluetooth 5.3', active: true }
    ],
    reviews: [
      { id: 'r3', userName: 'Mike D.', rating: 5, comment: 'Best spatial audio I have ever heard.', date: '2024-03-12' }
    ]
  },
  {
    id: 'p3',
    name: 'SwiftGlide X',
    brand: 'Reflex',
    category: 'Mice',
    price: 79.00,
    originalPrice: 89.00,
    rating: 4.9,
    reviewCount: 256,
    description: 'At only 45 grams, the SwiftGlide X is the lightest mouse in the Obsidian collection. Zero latency, zero drag.',
    imageUrl: '/images/mouse.png',
    galleryUrls: ['/images/mouse.png', '/images/mouse.png'],
    stockStatus: 'IN_STOCK',
    specifications: [
      { label: 'Sensor', value: 'Precision Optic v4 (32k DPI)', active: true },
      { label: 'Weight', value: '45 Grams (Ultralight)' },
      { label: 'Switches', value: 'Magnus-Switch (100M Click)' },
      { label: 'Feet', value: '100% Virgin PTFE' }
    ],
    reviews: []
  },
  {
    id: 'p4',
    name: 'Vortex G9 Monitor',
    brand: 'Zenith',
    category: 'Monitors',
    price: 549.00,
    rating: 4.7,
    reviewCount: 42,
    description: 'Experience pure clarity with the Vortex G9. 240Hz refresh rate and OLED technology for the deepest blacks.',
    imageUrl: '/images/monitor.png',
    galleryUrls: ['/images/monitor.png', '/images/monitor.png'],
    stockStatus: 'IN_STOCK',
    specifications: [
      { label: 'Panel', value: 'OLED (Infinite Contrast)', active: true },
      { label: 'Hz', value: '240Hz Ultra-Sync' },
      { label: 'Response', value: '0.03ms (GtG)' },
      { label: 'HDR', value: 'True-Black HDR 500' }
    ],
    reviews: []
  },
  // Adding more products to populate the catalog
  {
    id: 'p5',
    name: 'CoreX Pro Keyboard',
    brand: 'Vanguard',
    category: 'Keyboards',
    price: 179.00,
    rating: 4.5,
    reviewCount: 67,
    description: 'A professional grade mechanical keyboard with hot-swappable switches and dual-layer sound dampening.',
    imageUrl: '/images/keyboard.png',
    galleryUrls: ['/images/keyboard.png'],
    stockStatus: 'IN_STOCK',
    specifications: [
      { label: 'Switch', value: 'Mechanical Brown (Tactile)', active: true },
      { label: 'Keycaps', value: 'PBT Double-Shot' }
    ],
    reviews: []
  },
  {
    id: 'p6',
    name: 'Acoustic Elite',
    brand: 'AeroFlow',
    category: 'Audio',
    price: 299.00,
    rating: 4.9,
    reviewCount: 31,
    description: 'Reference-level studio headphones for the most demanding audiophiles and professionals.',
    imageUrl: '/images/headset.png',
    galleryUrls: ['/images/headset.png'],
    isFeatured: true,
    stockStatus: 'IN_STOCK',
    specifications: [
      { label: 'Type', value: 'Planar Magnetic', active: true },
      { label: 'Impedance', value: '32 Ohms' }
    ],
    reviews: []
  },
  {
    id: 'p7',
    name: 'Mouse V2 Pro',
    brand: 'Reflex',
    category: 'Mice',
    price: 109.00,
    rating: 4.4,
    reviewCount: 112,
    description: 'The professional standard for competitive gaming. Ergonomically refined for max comfort.',
    imageUrl: '/images/mouse.png',
    galleryUrls: ['/images/mouse.png'],
    stockStatus: 'OUT_OF_STOCK',
    specifications: [
      { label: 'Ergo', value: 'Right Handed (Large)', active: true }
    ],
    reviews: []
  },
  {
    id: 'p8',
    name: 'UltraEdge 27"',
    brand: 'Zenith',
    category: 'Monitors',
    price: 399.00,
    rating: 4.6,
    reviewCount: 88,
    description: 'Bezel-less 4K display with high color accuracy, perfect for creative professionals.',
    imageUrl: '/images/monitor.png',
    galleryUrls: ['/images/monitor.png'],
    stockStatus: 'IN_STOCK',
    specifications: [
      { label: 'Resolution', value: '4K Ultra HD', active: true }
    ],
    reviews: []
  }
];
