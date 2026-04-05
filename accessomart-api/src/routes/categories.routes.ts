import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const categoryRoutes = Router();

// ─── GET /api/v1/categories ──────────────────────────────────────────────────
categoryRoutes.get('/', async (_req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { products: true } },
      },
    });
    return res.json({ categories });
  } catch (error: any) {
    console.error('[API Error] GET /categories failed:', error.message);
    return res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// ─── GET /api/v1/categories/:slug ─────────────────────────────────────────────
categoryRoutes.get('/:slug', async (req, res) => {
  try {
    const category = await prisma.category.findUnique({
      where: { slug: req.params.slug },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { sortOrder: 'asc' },
        },
      },
    });
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }
    
    return res.json({ category });
  } catch (error: any) {
    console.error(`[API Error] GET /categories/${req.params.slug} failed:`, error.message);
    return res.status(500).json({ error: 'Failed to fetch category detail' });
  }
});
