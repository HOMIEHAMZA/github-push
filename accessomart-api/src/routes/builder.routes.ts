import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { z } from 'zod';

export const builderRoutes = Router();

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const pcBuildSchema = z.object({
  name: z.string().min(1).optional(),
  totalPrice: z.number().positive(),
  compatibilityWarnings: z.array(z.string()).default([]),
  components: z.array(z.object({
    category: z.string().min(1),
    variantId: z.string().min(1),
    productId: z.string().min(1),
    quantity: z.number().int().min(1).default(1),
  })).min(1),
});

const wishlistSchema = z.object({
  productId: z.string().min(1),
});

// ─── POST /api/v1/builder/save ────────────────────────────────────────────────
builderRoutes.post('/save', authenticate, validate(pcBuildSchema), async (req: AuthRequest, res) => {
  const { name, components, totalPrice, compatibilityWarnings } = req.body;
  // components: { category, variantId, productId, quantity }[]

  const build = await prisma.pCBuild.create({
    data: {
      userId: req.userId,
      name: name || 'My Build',
      totalPrice,
      isSaved: true,
      compatibilityWarnings: compatibilityWarnings || [],
      items: {
        create: components.map((c: any) => ({
          variantId: c.variantId,
          productId: c.productId,
          category: c.category,
          quantity: c.quantity || 1,
        })),
      },
    },
    include: { items: true },
  });
  return res.status(201).json({ build });
});

// ─── GET /api/v1/builder/my-builds ───────────────────────────────────────────
builderRoutes.get('/my-builds', authenticate, async (req: AuthRequest, res) => {
  const builds = await prisma.pCBuild.findMany({
    where: { userId: req.userId, isSaved: true },
    include: {
      items: {
        include: {
          variant: { include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ builds });
});

// ─── GET /api/v1/builder/components ──────────────────────────────────────────
// Returns products organized by PC component category
builderRoutes.get('/components', async (_req, res) => {
  const BUILDER_CATEGORIES = ['CPU', 'Motherboard', 'GPU', 'RAM', 'Storage', 'Power Supply', 'Case', 'Cooling'];

  const categories = await prisma.category.findMany({
    where: {
      name: { in: BUILDER_CATEGORIES },
      isActive: true,
    },
    include: {
      products: {
        where: { status: 'ACTIVE' },
        include: {
          variants: {
            where: { isActive: true },
            include: { inventory: true },
          },
          images: { where: { isPrimary: true }, take: 1 },
          specs: true,
        },
      },
    },
  });

  return res.json({ categories });
});

// ─── DELETE /api/v1/builder/:id ───────────────────────────────────────────────
builderRoutes.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  await prisma.pCBuild.delete({
    where: { id: req.params.id, userId: req.userId },
  });
  return res.json({ message: 'Build deleted.' });
});

// ─── Stub routes for other files
export const categoryRoutes = Router();
categoryRoutes.get('/', async (_req, res) => {
  const categories = await prisma.category.findMany({
    where: { isActive: true, parentId: null },
    include: { children: { where: { isActive: true } } },
    orderBy: { sortOrder: 'asc' },
  });
  return res.json({ categories });
});

export const userRoutes = Router();
userRoutes.get('/profile', authenticate, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { addresses: true },
  });
  return res.json({ user });
});

export const reviewRoutes = Router();
reviewRoutes.get('/product/:productId', async (req, res) => {
  const reviews = await prisma.review.findMany({
    where: { productId: req.params.productId, isApproved: true },
    include: { user: { select: { firstName: true, lastName: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return res.json({ reviews });
});

export const wishlistRoutes = Router();
wishlistRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    include: { product: { include: { images: { where: { isPrimary: true }, take: 1 } } } },
  });
  return res.json({ items });
});
wishlistRoutes.post('/', authenticate, validate(wishlistSchema), async (req: AuthRequest, res) => {
  const item = await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: req.userId!, productId: req.body.productId } },
    update: {},
    create: { userId: req.userId!, productId: req.body.productId },
  });
  return res.status(201).json({ item });
});
wishlistRoutes.delete('/:productId', authenticate, async (req: AuthRequest, res) => {
  await prisma.wishlistItem.deleteMany({
    where: { userId: req.userId, productId: req.params.productId },
  });
  return res.json({ message: 'Removed from wishlist.' });
});
