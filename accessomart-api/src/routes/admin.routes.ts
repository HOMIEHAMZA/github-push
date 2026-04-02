import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload, cloudinary } from '../lib/cloudinary';

export const adminRoutes = Router();

// All admin routes require auth + admin role
adminRoutes.use(authenticate, requireAdmin);

// ─── GET /api/v1/admin/dashboard ──────────────────────────────────────────────
adminRoutes.get('/dashboard', async (_req, res) => {
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    recentOrders,
    lowStockItems,
  ] = await prisma.$transaction([
    prisma.order.count(),
    prisma.product.count({ where: { status: 'ACTIVE' } }),
    prisma.user.count(),
    prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { firstName: true, lastName: true } }, _count: { select: { items: true } } },
    }),
    prisma.inventory.findMany({
      where: { quantity: { lte: prisma.inventory.fields.lowStockThreshold } },
      include: { variant: { include: { product: true } } },
      take: 10,
    }),
  ]);

  const revenueResult = await prisma.order.aggregate({
    where: { status: { in: ['DELIVERED', 'CONFIRMED', 'PROCESSING', 'SHIPPED'] } },
    _sum: { total: true },
  });

  return res.json({
    stats: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalRevenue: revenueResult._sum.total || 0,
    },
    recentOrders,
    lowStockItems,
  });
});

// ─── Homepage Sections CMS ────────────────────────────────────────────────────
adminRoutes.get('/homepage', async (_req, res) => {
  const sections = await prisma.homepageSection.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { banners: true },
  });
  return res.json({ sections });
});

adminRoutes.patch('/homepage/:id', async (req, res) => {
  const section = await prisma.homepageSection.update({
    where: { id: req.params.id },
    data: req.body,
  });
  return res.json({ section });
});

// ─── Admin Settings ───────────────────────────────────────────────────────────
adminRoutes.get('/settings', async (_req, res) => {
  const settings = await prisma.adminSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return res.json({ settings: map });
});

adminRoutes.put('/settings/:key', async (req, res) => {
  const setting = await prisma.adminSetting.upsert({
    where: { key: req.params.key },
    update: { value: req.body.value },
    create: { key: req.params.key, value: req.body.value, label: req.body.label },
  });
  return res.json({ setting });
});

// ─── Admin Orders ─────────────────────────────────────────────────────────────
adminRoutes.get('/orders', async (req, res) => {
  const { status, page = '1', limit = '20' } = req.query;
  const where: any = {};
  if (status) where.status = status;

  const [orders, total] = await prisma.$transaction([
    prisma.order.findMany({
      where,
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        _count: { select: { items: true } },
        payment: { select: { status: true, provider: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return res.json({ orders, total });
});

// ─── Admin Customers ──────────────────────────────────────────────────────────
adminRoutes.get('/customers', async (req, res) => {
  const { page = '1', limit = '20', search } = req.query;
  const where: any = { role: 'CUSTOMER' };

  if (search) {
    where.OR = [
      { email: { contains: search as string, mode: 'insensitive' } },
      { firstName: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const customers = await prisma.user.findMany({
    where,
    skip: (parseInt(page as string) - 1) * parseInt(limit as string),
    take: parseInt(limit as string),
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return res.json({ customers });
});

// ─── Admin Brands ─────────────────────────────────────────────────────────────
adminRoutes.get('/brands', async (_req, res) => {
  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: 'asc' },
    });
    return res.json({ brands });
  } catch {
    return res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

adminRoutes.post('/brands', async (req, res) => {
  try {
    const brand = await prisma.brand.create({
      data: req.body,
    });
    return res.status(201).json({ brand });
  } catch {
    return res.status(500).json({ error: 'Failed to create brand' });
  }
});

// ─── Admin Categories ─────────────────────────────────────────────────────────
adminRoutes.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  return res.json({ categories });
});

adminRoutes.post('/categories', async (req, res) => {
  const category = await prisma.category.create({
    data: req.body,
  });
  return res.status(201).json({ category });
});

// ─── Admin Products ───────────────────────────────────────────────────────────
const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  basePrice: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  costPrice: z.number().positive().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.boolean().default(false),
  isDigital: z.boolean().default(false),
  weight: z.number().optional(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().optional(),
  metaDesc: z.string().optional(),
});

const productUpdateSchema = productCreateSchema.partial();

adminRoutes.get('/products', async (req, res) => {
  const {
    page = '1',
    limit = '20',
    status,
    categoryId,
    brandId,
    search,
  } = req.query;

  const where: any = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (brandId) where.brandId = brandId;
  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: 'insensitive' } },
      { slug: { contains: search as string, mode: 'insensitive' } },
      { description: { contains: search as string, mode: 'insensitive' } },
    ];
  }

  const [products, total] = await prisma.$transaction([
    prisma.product.findMany({
      where,
      skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      take: parseInt(limit as string),
      include: {
        brand: true,
        category: true,
        images: { take: 1, where: { isPrimary: true } },
        variants: {
          include: { inventory: true },
        },
        _count: { select: { variants: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.product.count({ where }),
  ]);

  return res.json({ products, total });
});

adminRoutes.get('/products/:id', async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      brand: true,
      category: true,
      images: { orderBy: { sortOrder: 'asc' } },
      variants: {
        include: { inventory: true },
        orderBy: { createdAt: 'asc' },
      },
      specs: { orderBy: { sortOrder: 'asc' } },
    },
  });

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  return res.json({ product });
});

adminRoutes.post('/products', async (req, res) => {
  try {
    const body = { ...req.body };

    if (body.price !== undefined && body.basePrice === undefined) {
      body.basePrice = body.price;
    }

    if (!body.slug && body.name) {
      body.slug = body.name
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/--+/g, '-')
        .trim();
    }

    if (body.brandId === '') body.brandId = undefined;
    if (body.categoryId === '') body.categoryId = undefined;

    const bodyCleaned = { ...body };
    if (bodyCleaned.brandId === '') bodyCleaned.brandId = undefined;
    if (bodyCleaned.categoryId === '') bodyCleaned.categoryId = undefined;

    const data = productCreateSchema.parse(bodyCleaned);

    const product = await prisma.product.create({
      data: {
        ...data,
        slug: data.slug || bodyCleaned.slug,
        basePrice: data.basePrice,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        weight: data.weight,
        status: data.status || 'DRAFT',
      } as any,
      include: {
        brand: true,
        category: true,
      },
    });

    return res.status(201).json({ product });
  } catch (error: any) {
    console.error('Product Creation Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    return res.status(400).json({ error: error?.message || 'Failed to create product' });
  }
});

adminRoutes.patch('/products/:id', async (req, res) => {
  try {
    const data = productUpdateSchema.parse(req.body);

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...data,
        basePrice: data.basePrice,
        comparePrice: data.comparePrice,
        costPrice: data.costPrice,
        weight: data.weight,
      } as any,
      include: {
        brand: true,
        category: true,
      },
    });

    return res.json({ product });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to update product' });
  }
});

adminRoutes.delete('/products/:id', async (req, res) => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    return res.json({ message: 'Product archived', product });
  } catch {
    return res.status(404).json({ error: 'Product not found' });
  }
});

// ─── Product Image Management ─────────────────────────────────────────────────
type CloudinaryFile = {
  path: string;
};

adminRoutes.post('/products/:id/images', upload.array('images', 10), async (req, res) => {
  try {
    const productId = req.params.id;
    const files = (req.files as CloudinaryFile[]) || [];

    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { images: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const imageData = files.map((file, index) => ({
      productId,
      url: file.path,
      altText: product.name,
      isPrimary: product.images.length === 0 && index === 0,
      sortOrder: product.images.length + index,
    }));

    await prisma.productImage.createMany({
      data: imageData,
    });

    const updatedImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });

    return res.status(201).json({ images: updatedImages });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return res.status(500).json({
      error: 'Failed to upload images',
      details: error?.message || 'Unknown server error',
    });
  }
});

adminRoutes.post('/products/:id/images/:imageId/primary', async (req, res) => {
  const { id, imageId } = req.params;

  try {
    const result = await prisma.$transaction([
      prisma.productImage.updateMany({
        where: { productId: id },
        data: { isPrimary: false },
      }),
      prisma.productImage.update({
        where: { id: imageId },
        data: { isPrimary: true },
      }),
    ]);

    return res.json({ message: 'Primary image updated', result });
  } catch (error: any) {
    console.error('Set Primary Error:', error);
    return res.status(500).json({ error: 'Failed to set primary image', details: error.message });
  }
});

adminRoutes.delete('/products/:productId/images/:imageId', async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    const image = await prisma.productImage.findFirst({
      where: { id: imageId, productId },
    });

    if (!image) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const urlParts = image.url.split('/');
    const folderIndex = urlParts.indexOf('accessomart');
    const publicIdWithExt = urlParts.slice(folderIndex).join('/');
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, '');

    await cloudinary.uploader.destroy(publicId);

    await prisma.productImage.delete({
      where: { id: imageId },
    });

    if (image.isPrimary) {
      const nextImage = await prisma.productImage.findFirst({
        where: { productId },
        orderBy: { sortOrder: 'asc' },
      });

      if (nextImage) {
        await prisma.productImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true },
        });
      }
    }

    return res.json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Delete Error:', error);
    return res.status(500).json({ error: 'Failed to delete image' });
  }
});

adminRoutes.patch('/products/:productId/images/:imageId/primary', async (req, res) => {
  try {
    const { productId, imageId } = req.params;

    await prisma.productImage.updateMany({
      where: { productId },
      data: { isPrimary: false },
    });

    const image = await prisma.productImage.update({
      where: { id: imageId },
      data: { isPrimary: true },
    });

    return res.json({ image });
  } catch {
    return res.status(500).json({ error: 'Failed to update primary image' });
  }
});

// ─── Product Variants & Inventory ─────────────────────────────────────────────
const variantCreateSchema = z.object({
  productId: z.string(),
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  comparePrice: z.number().positive().optional(),
  attributes: z.record(z.any()).default({}),
  imageUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
});

adminRoutes.post('/variants', async (req, res) => {
  try {
    const data = variantCreateSchema.parse(req.body);

    const variant = await prisma.$transaction(async (tx) => {
      const createdVariant = await tx.productVariant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          name: data.name,
          price: data.price,
          comparePrice: data.comparePrice,
          attributes: data.attributes,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
        },
      });

      await tx.inventory.create({
        data: {
          variantId: createdVariant.id,
          quantity: data.quantity,
          lowStockThreshold: data.lowStockThreshold,
        },
      });

      return createdVariant;
    });

    const variantWithInventory = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { inventory: true, product: true },
    });

    return res.status(201).json({ variant: variantWithInventory });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create variant' });
  }
});

adminRoutes.patch('/variants/:id', async (req, res) => {
  try {
    const { quantity, lowStockThreshold, ...variantData } = req.body;

    const variant = await prisma.productVariant.update({
      where: { id: req.params.id },
      data: variantData,
    });

    if (quantity !== undefined || lowStockThreshold !== undefined) {
      await prisma.inventory.update({
        where: { variantId: req.params.id },
        data: {
          ...(quantity !== undefined && { quantity }),
          ...(lowStockThreshold !== undefined && { lowStockThreshold }),
        },
      });
    }

    const variantWithInventory = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { inventory: true, product: true },
    });

    return res.json({ variant: variantWithInventory });
  } catch {
    return res.status(404).json({ error: 'Variant not found' });
  }
});

adminRoutes.patch('/inventory/:variantId', async (req, res) => {
  const { quantity, operation } = req.body;

  try {
    const inventory = await prisma.inventory.findUnique({
      where: { variantId: req.params.variantId },
    });

    if (!inventory) {
      return res.status(404).json({ error: 'Inventory not found' });
    }

    let newQuantity = inventory.quantity;

    if (operation === 'set') {
      newQuantity = quantity;
    } else if (operation === 'adjust') {
      newQuantity = inventory.quantity + quantity;
    } else {
      return res.status(400).json({ error: 'Invalid operation. Use "set" or "adjust".' });
    }

    const updated = await prisma.inventory.update({
      where: { variantId: req.params.variantId },
      data: { quantity: newQuantity },
      include: { variant: { include: { product: true } } },
    });

    return res.json({ inventory: updated });
  } catch {
    return res.status(500).json({ error: 'Failed to update inventory' });
  }
});

adminRoutes.get('/inventory', async (_req, res) => {
  const inventoryItems = await prisma.inventory.findMany({
    include: {
      variant: {
        include: {
          product: {
            include: { brand: true },
          },
        },
      },
    },
    orderBy: { variant: { sku: 'asc' } },
  });

  return res.json({ inventoryItems });
});

adminRoutes.get('/inventory/low-stock', async (_req, res) => {
  const lowStockItems = await prisma.inventory.findMany({
    where: {
      OR: [{ quantity: { lte: 5 } }],
    },
    include: {
      variant: {
        include: {
          product: {
            include: { brand: true },
          },
        },
      },
    },
    orderBy: { quantity: 'asc' },
  });

  return res.json({ lowStockItems });
});

// ─── Admin Order Management ───────────────────────────────────────────────────
adminRoutes.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;

  const validStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const updateData: any = { status };

    if (status === 'SHIPPED') {
      updateData.shippedAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    } else if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        user: { select: { firstName: true, lastName: true, email: true } },
        items: { include: { variant: { include: { product: true } } } },
        address: true,
        payment: true,
      },
    });

    return res.json({ order });
  } catch {
    return res.status(404).json({ error: 'Order not found' });
  }
});

adminRoutes.get('/orders/:id', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { id: req.params.id },
    include: {
      user: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: { include: { variant: { include: { product: true } } } },
      address: true,
      payment: true,
    },
  });

  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

  return res.json({ order });
});

// ─── Admin Customer Details ───────────────────────────────────────────────────
adminRoutes.get('/customers/:id', async (req, res) => {
  const customer = await prisma.user.findUnique({
    where: { id: req.params.id, role: 'CUSTOMER' },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      avatarUrl: true,
      isActive: true,
      emailVerified: true,
      createdAt: true,
      updatedAt: true,
      addresses: true,
      orders: {
        include: {
          items: true,
          payment: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 20,
      },
      _count: {
        select: { orders: true, reviews: true, wishlist: true },
      },
    },
  });

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' });
  }

  return res.json({ customer });
});