import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';

export const cartRoutes = Router();

// ─── GET /api/v1/cart ─────────────────────────────────────────────────────────
cartRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  const cart = await prisma.cart.findUnique({
    where: { userId: req.userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  brand: true,
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
              inventory: true,
            },
          },
        },
      },
    },
  });

  if (!cart) return res.json({ cart: null, items: [], total: 0 });

  const total = cart.items.reduce(
    (sum, item) => sum + Number(item.variant.price) * item.quantity,
    0
  );

  return res.json({ cart, items: cart.items, total });
});

// ─── POST /api/v1/cart/items ──────────────────────────────────────────────────
cartRoutes.post('/items', authenticate, async (req: AuthRequest, res) => {
  const { variantId, quantity = 1 } = req.body;

  // Get or create cart
  let cart = await prisma.cart.findUnique({ where: { userId: req.userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId: req.userId } });
  }

  const variant = await prisma.productVariant.findUnique({
    where: { id: variantId },
    include: { inventory: true },
  });
  if (!variant) return res.status(404).json({ error: 'Variant not found.' });

  // Strict enforcement: require inventory record
  if (!variant.inventory) {
    return res.status(409).json({ error: 'Product is currently unavailable (no inventory).' });
  }

  // Get current quantity in cart for this variant
  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, variantId },
  });
  const currentQty = existingItem?.quantity || 0;

  const available = variant.inventory.quantity - variant.inventory.reservedQty;
  if (currentQty + quantity > available) {
    return res.status(409).json({ 
      error: `Insufficient stock. Only ${available} available, you already have ${currentQty} in cart.` 
    });
  }


  // Upsert cart item
  if (existingItem) {
    const item = await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity },
    });
    return res.json({ item });
  }

  const item = await prisma.cartItem.create({
    data: { cartId: cart.id, variantId, quantity },
  });
  return res.status(201).json({ item });
});

// ─── PATCH /api/v1/cart/items/:itemId ────────────────────────────────────────
cartRoutes.patch('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  const { quantity } = req.body;

  if (quantity <= 0) {
    await prisma.cartItem.delete({ where: { id: req.params.itemId } });
    return res.json({ message: 'Item removed.' });
  }

  // Check stock for update
  const cartItem = await prisma.cartItem.findUnique({
    where: { id: req.params.itemId },
    include: { variant: { include: { inventory: true } } },
  });

  if (!cartItem) return res.status(404).json({ error: 'Cart item not found.' });

  if (!cartItem.variant.inventory) {
    return res.status(409).json({ error: 'Product is out of stock.' });
  }

  const available = cartItem.variant.inventory.quantity - cartItem.variant.inventory.reservedQty;
  if (quantity > available) {
    return res.status(409).json({ error: `Insufficient stock. Only ${available} units available.` });
  }

  const item = await prisma.cartItem.update({
    where: { id: req.params.itemId },
    data: { quantity },
  });
  return res.json({ item });
});

// ─── DELETE /api/v1/cart/items/:itemId ───────────────────────────────────────
cartRoutes.delete('/items/:itemId', authenticate, async (req: AuthRequest, res) => {
  await prisma.cartItem.delete({ where: { id: req.params.itemId } });
  return res.json({ message: 'Item removed.' });
});

// ─── DELETE /api/v1/cart ──────────────────────────────────────────────────────
cartRoutes.delete('/', authenticate, async (req: AuthRequest, res) => {
  await prisma.cartItem.deleteMany({
    where: { cart: { userId: req.userId } },
  });
  return res.json({ message: 'Cart cleared.' });
});
