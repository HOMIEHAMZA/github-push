import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const wishlistRoutes = Router();

// ─── GET /api/v1/wishlist ────────────────────────────────────────────────────
wishlistRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  const wishlist = await prisma.wishlistItem.findMany({
    where: { userId: req.userId },
    include: {
      product: {
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          },
          variants: {
            take: 1
          },
          brand: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ wishlist });
});

// ─── POST /api/v1/wishlist ───────────────────────────────────────────────────
wishlistRoutes.post('/', authenticate, async (req: AuthRequest, res) => {
  const { productId } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required.' });
  }

  try {
    const item = await prisma.wishlistItem.upsert({
      where: {
        userId_productId: {
          userId: req.userId!,
          productId
        }
      },
      update: {},
      create: {
        userId: req.userId!,
        productId
      },
      include: {
        product: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            },
            variants: {
              take: 1
            },
            brand: true
          }
        }
      }
    });

    res.status(201).json({ item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add to wishlist.' });
  }
});

// ─── DELETE /api/v1/wishlist/:productId ───────────────────────────────────────
wishlistRoutes.delete('/:productId', authenticate, async (req: AuthRequest, res) => {
  const { productId } = req.params;

  try {
    await prisma.wishlistItem.delete({
      where: {
        userId_productId: {
          userId: req.userId!,
          productId
        }
      }
    });

    res.json({ success: true });
  } catch (error) {
    res.status(404).json({ error: 'Item not found in wishlist.' });
  }
});
