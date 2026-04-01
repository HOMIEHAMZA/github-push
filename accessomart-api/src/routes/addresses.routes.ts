import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { z } from 'zod';
import { validate } from '../middleware/validate.middleware';

export const addressRoutes = Router();

const addressSchema = z.object({
  label: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  line1: z.string().min(1),
  line2: z.string().optional(),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().default('US'),
  isDefault: z.boolean().default(false),
  phone: z.string().optional(),
});

// ─── GET /api/v1/addresses ───────────────────────────────────────────────────
addressRoutes.get('/', authenticate, async (req: AuthRequest, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.userId },
    orderBy: { isDefault: 'desc' },
  });
  res.json({ addresses });
});

// ─── POST /api/v1/addresses ──────────────────────────────────────────────────
addressRoutes.post('/', authenticate, validate(addressSchema), async (req: AuthRequest, res) => {
  const data = req.body;

  // If this is the first address or set as default, handle default flag
  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.create({
    data: {
      ...data,
      userId: req.userId!,
    },
  });

  res.status(201).json({ address });
});

// ─── PATCH /api/v1/addresses/:id ─────────────────────────────────────────────
addressRoutes.patch('/:id', authenticate, validate(addressSchema.partial()), async (req: AuthRequest, res) => {
  const { id } = req.params;
  const data = req.body;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) return res.status(404).json({ error: 'Address not found.' });

  if (data.isDefault) {
    await prisma.address.updateMany({
      where: { userId: req.userId },
      data: { isDefault: false },
    });
  }

  const address = await prisma.address.update({
    where: { id },
    data,
  });

  res.json({ address });
});

// ─── DELETE /api/v1/addresses/:id ────────────────────────────────────────────
addressRoutes.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const existing = await prisma.address.findFirst({
    where: { id, userId: req.userId },
  });

  if (!existing) return res.status(404).json({ error: 'Address not found.' });

  await prisma.address.delete({ where: { id } });

  res.json({ success: true });
});
