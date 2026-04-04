import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

export const productRoutes = Router();

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  shortDesc: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  basePrice: z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().nullable().optional(),
  costPrice: z.coerce.number().positive().nullable().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.coerce.boolean().default(false),
  tags: z.array(z.string()).default([]),
});

const productUpdateSchema = productCreateSchema.partial();

// ─── GET /api/v1/products ─────────────────────────────────────────────────────
// Supports: ?category=slug&brand=slug&search=term&sort=price_asc|price_desc|newest|popular&page=1&limit=20&minPrice=10&maxPrice=100
productRoutes.get('/', async (req, res, next) => {
  try {
    const {
      category, brand, search, sort,
      minPrice, maxPrice,
      page = '1', limit = '20',
      featured,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.max(1, parseInt(limit as string) || 20);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { status: 'ACTIVE' };

    // Relations filtering
    if (typeof category === 'string') where.category = { slug: category };
    if (typeof brand === 'string')    where.brand = { slug: brand };
    
    // Boolean filtering
    if (featured === 'true' || featured === '') where.isFeatured = true;
    
    // Text search
    if (typeof search === 'string')   where.name = { contains: search, mode: 'insensitive' };
    
    // Number filtering
    if (minPrice || maxPrice) {
      where.basePrice = {};
      if (minPrice && !isNaN(parseFloat(minPrice as string))) {
        where.basePrice.gte = parseFloat(minPrice as string);
      }
      if (maxPrice && !isNaN(parseFloat(maxPrice as string))) {
        where.basePrice.lte = parseFloat(maxPrice as string);
      }
    }

    const orderBy: any =
      sort === 'price_asc'  ? { basePrice: 'asc' }  :
      sort === 'price_desc' ? { basePrice: 'desc' } :
      sort === 'popular'    ? { reviews: { _count: 'desc' } } :
      { createdAt: 'desc' }; // default: newest

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          category: { select: { id: true, name: true, slug: true } },
          images: { 
            orderBy: { sortOrder: 'asc' },
            take: 2 // get primary and maybe one secondary for hover effects
          },
          variants: { 
            where: { isActive: true }, 
            orderBy: { price: 'asc' } 
          },
          _count: { select: { reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Shape the response slightly closer to frontend needs
    const frontendFormattedProducts = products.map((p: any) => ({
      ...p,
      reviewCount: p._count.reviews,
      _count: undefined, // remove raw prisma count obj
    }));

    return res.json({
      products: frontendFormattedProducts,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error: any) {
    console.error('\n[API Error] GET /products failed. DB might be empty or unconfigured.');
    console.error('Details:', error?.message || error);
    
    // Graceful fallback: return empty products so frontend doesn't break
    return res.json({
      products: [],
      pagination: {
        total: 0,
        page: Math.max(1, parseInt(req.query.page as string) || 1),
        limit: Math.max(1, parseInt(req.query.limit as string) || 20),
        totalPages: 0,
      },
    });
  }
});

// ─── GET /api/v1/products/:slug ───────────────────────────────────────────────
productRoutes.get('/:slug', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { slug: req.params.slug },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        where: { isActive: true },
        include: { inventory: true },
        orderBy: { price: 'asc' },
      },
      specs: { orderBy: [{ groupName: 'asc' }, { sortOrder: 'asc' }] },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { firstName: true, lastName: true, avatarUrl: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: { select: { reviews: true } },
    },
  });

  if (!product) return res.status(404).json({ error: 'Product not found.' });
  return res.json({ product });
});

// ─── POST /api/v1/products (Admin only) ───────────────────────────────────────
productRoutes.post('/', authenticate, requireAdmin, validate(productCreateSchema), async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.create({
      data: req.body as any,
    });
    return res.status(201).json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create product', details: err.message });
  }
});

// ─── PATCH /api/v1/products/:id (Admin only) ──────────────────────────────────
productRoutes.patch('/:id', authenticate, requireAdmin, validate(productUpdateSchema), async (req: AuthRequest, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body as any,
    });
    return res.json({ product });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to update product', details: err.message });
  }
});

// ─── DELETE /api/v1/products/:id (Admin only) ─────────────────────────────────
productRoutes.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res) => {
  await prisma.product.update({
    where: { id: req.params.id },
    data: { status: 'ARCHIVED' },
  });
  return res.json({ message: 'Product archived.' });
});
