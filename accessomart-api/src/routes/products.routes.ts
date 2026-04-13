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

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(5),
});

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
  const [product, reviewStats] = await Promise.all([
    prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: {
          where: { isActive: { not: false } },
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
        _count: { 
          select: { 
            reviews: { where: { isApproved: true } } 
          } 
        },
      },
    }),
    prisma.review.aggregate({
      where: { product: { slug: req.params.slug }, isApproved: true },
      _avg: { rating: true },
    })
  ]);

  if (!product) return res.status(404).json({ error: 'Product not found.' });
  
  const averageRating = reviewStats._avg.rating ? Number(reviewStats._avg.rating.toFixed(1)) : 0;
  
  return res.json({ 
    product: { 
      ...product, 
      averageRating, 
      reviewCount: product._count.reviews 
    } 
  });
});

// ─── POST /api/v1/products/:id/reviews ────────────────────────────────────────
productRoutes.post('/:id/reviews', authenticate, validate(reviewSchema), async (req: AuthRequest, res) => {
  try {
    const { rating, title, body } = req.body;
    
    // Create the review
    const review = await prisma.review.create({
      data: {
        rating,
        title,
        body,
        isApproved: true, // MVP: auto-approve
        userId: req.userId!,
        productId: req.params.id,
      }
    });

    return res.status(201).json({ review });
  } catch (error: any) {
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'You have already reviewed this product.' });
    }
    return res.status(500).json({ error: 'Failed to submit review.', details: error.message });
  }
});

// ─── PATCH /api/v1/products/:id/reviews/:reviewId ─────────────────────────────
productRoutes.patch('/:id/reviews/:reviewId', authenticate, validate(reviewSchema.partial()), async (req: AuthRequest, res) => {
  try {
    const { reviewId } = req.params;
    
    // Verify ownership
    const existing = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existing) return res.status(404).json({ error: 'Review not found.' });
    if (existing.userId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to edit this review.' });
    }

    const review = await prisma.review.update({
      where: { id: reviewId },
      data: req.body,
    });

    return res.json({ review });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to update review.', details: error.message });
  }
});

// ─── DELETE /api/v1/products/:id/reviews/:reviewId ────────────────────────────
productRoutes.delete('/:id/reviews/:reviewId', authenticate, async (req: AuthRequest, res) => {
  try {
    const { reviewId } = req.params;

    // Verify ownership
    const existing = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!existing) return res.status(404).json({ error: 'Review not found.' });
    if (existing.userId !== req.userId && req.userRole !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized to delete this review.' });
    }

    await prisma.review.delete({
      where: { id: reviewId }
    });

    return res.json({ message: 'Review deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete review.', details: error.message });
  }
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
