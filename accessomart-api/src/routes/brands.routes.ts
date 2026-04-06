import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const brandsRoutes = Router();

// ─── GET /api/v1/brands ──────────────────────────────────────────────────────
brandsRoutes.get('/', async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return res.json({ brands });
  } catch (error: any) {
    console.error('[API Error] GET /brands failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
});
