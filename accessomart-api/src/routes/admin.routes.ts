import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { upload, cloudinary } from '../lib/cloudinary';
import { validate } from '../middleware/validate.middleware';

export const adminRoutes = Router();

// All admin routes require auth + admin role
adminRoutes.use(authenticate, requireAdmin);

// ─── SCHEMAS ──────────────────────────────────────────────────────────────────

const homepageSectionSchema = z.object({
  title: z.string().nullable().optional(),
  subtitle: z.string().nullable().optional(),
  isEnabled: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  config: z.record(z.any()).optional(),
});

const adminSettingSchema = z.object({
  value: z.string().min(1),
  label: z.string().min(1).optional(),
});

const brandSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  logoUrl: z.string().url().nullable().optional(),
  description: z.string().nullable().optional(),
});

const categorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  iconName: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
  parentId: z.string().nullable().optional(),
});

const inventoryUpdateSchema = z.object({
  quantity: z.number().int().min(0).optional(),
  operation: z.enum(['set', 'adjust']).default('set'),
});

const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED']),
});

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

adminRoutes.patch('/homepage/:id', validate(homepageSectionSchema), async (req: any, res) => {
  try {
    const section = await prisma.homepageSection.update({
      where: { id: req.params.id },
      data: req.body,
    });
    return res.json({ section });
  } catch (err: any) {
    console.error(`[Admin API] Homepage Section update error (${req.params.id}):`, err);
    return res.status(500).json({ error: 'Failed to update section', details: err.message });
  }
});

// ─── Admin Settings ───────────────────────────────────────────────────────────
adminRoutes.get('/settings', async (_req, res) => {
  const settings = await prisma.adminSetting.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return res.json({ settings: map });
});

adminRoutes.put('/settings/:key', validate(adminSettingSchema), async (req: any, res) => {
  try {
    const setting = await prisma.adminSetting.upsert({
      where: { key: req.params.key },
      update: { value: req.body.value },
      create: { key: req.params.key, value: req.body.value, label: req.body.label },
    });
    return res.json({ setting });
  } catch (err: any) {
    console.error(`[Admin API] Setting upsert error (${req.params.key}):`, err);
    return res.status(500).json({ error: 'Failed to update setting', details: err.message });
  }
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

adminRoutes.post('/brands', validate(brandSchema), async (req: any, res) => {
  try {
    const brand = await prisma.brand.create({
      data: req.body,
    });
    return res.status(201).json({ brand });
  } catch (err: any) {
    console.error('[Admin API] Brand creation error:', err);
    return res.status(500).json({ error: 'Failed to create brand', details: err.message });
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

adminRoutes.post('/categories', validate(categorySchema), async (req: any, res) => {
  try {
    const category = await prisma.category.create({
      data: req.body,
    });
    return res.status(201).json({ category });
  } catch (err: any) {
    console.error('[Admin API] Category creation error:', err);
    return res.status(500).json({ error: 'Failed to create category', details: err.message });
  }
});

// ─── Admin Products ───────────────────────────────────────────────────────────
const productCreateSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
  shortDesc: z.string().nullable().optional(),
  brandId: z.string().nullable().optional(),
  categoryId: z.string().nullable().optional(),
  // z.coerce.number() safely converts numeric strings (e.g. from HTML inputs) → numbers
  basePrice: z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().nullable().optional(),
  costPrice: z.coerce.number().positive().nullable().optional(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']).default('DRAFT'),
  isFeatured: z.coerce.boolean().default(false),
  isDigital: z.coerce.boolean().default(false),
  weight: z.coerce.number().nullable().optional(),
  tags: z.array(z.string()).default([]),
  metaTitle: z.string().nullable().optional(),
  metaDesc: z.string().nullable().optional(),
  specs: z.array(z.object({
    groupName: z.string().nullable().optional(),
    specKey: z.string().min(1),
    specValue: z.string().min(1),
    sortOrder: z.number().int().default(0),
  })).optional(),
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
        // Fetch primary image first, fall back to first by sortOrder so thumbnails work
        // before a primary image is designated
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }], take: 1 },
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
    // Strip client-sent images array — images are managed separately via upload endpoints
    delete bodyCleaned.images;

    const data = productCreateSchema.parse(bodyCleaned);
    const slug = data.slug || bodyCleaned.slug || body.name.toLowerCase().replace(/\s+/g, '-');

    // Create product + default variant + inventory in one transaction so the
    // product appears in inventory immediately without manual intervention.
    const product = await prisma.$transaction(async (tx) => {
      const { specs, ...rest } = data;
      const created = await tx.product.create({
        data: {
          ...rest,
          slug,
          status: data.status || 'DRAFT',
          specs: specs && specs.length > 0 ? {
            create: specs
          } : undefined,
        } as any,
        include: {
          brand: true,
          category: true,
          images: true,
          variants: { include: { inventory: true } },
          specs: true,
        },
      });

      // Auto-create a default "Standard" variant so inventory tracking works
      // immediately. SKU format: slug-default (truncated to stay unique)
      const skuBase = slug.replace(/[^a-z0-9-]/g, '').substring(0, 40);
      const defaultVariant = await tx.productVariant.create({
        data: {
          productId: created.id,
          sku: `${skuBase}-default`,
          name: 'Standard',
          price: data.basePrice,
          isActive: true,
          isDefault: true,
        },
      });

      // Create the inventory record for the default variant
      await tx.inventory.create({
        data: {
          variantId: defaultVariant.id,
          quantity: 0,
          lowStockThreshold: 5,
        },
      });

      return created;
    });

    // Re-fetch to include the newly created variant + inventory
    const productWithVariants = await prisma.product.findUnique({
      where: { id: product.id },
      include: {
        brand: true,
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { include: { inventory: true } },
      },
    });

    return res.status(201).json({ product: productWithVariants });
  } catch (error: any) {
    console.error('Product Creation Error:', error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    // Duplicate slug produces a unique constraint error — give a readable message
    if (error?.code === 'P2002' && error?.meta?.target?.includes('slug')) {
      return res.status(400).json({ error: 'A product with this slug already exists. Change the name or set a custom slug.' });
    }

    return res.status(400).json({ error: error?.message || 'Failed to create product' });
  }
});

adminRoutes.patch('/products/:id', async (req, res) => {
  try {
    const body = { ...req.body };
    
    // Strip non-schema fields that the frontend might accidentally send
    delete body.images;
    delete body.variants;
    delete body.brand;
    delete body.category;
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    // Normalize empty strings to null for optional FK and text fields
    const optionalStringFields = ['brandId', 'categoryId', 'description', 'shortDesc', 'metaTitle', 'metaDesc', 'slug'];
    optionalStringFields.forEach(field => {
      if (body[field] === '') body[field] = null;
    });

    // Normalize empty numeric strings to undefined so they are skipped in partial update
    const numericFields = ['comparePrice', 'costPrice', 'weight'];
    numericFields.forEach(field => {
      if (body[field] === '' || body[field] === null) body[field] = undefined;
    });

    const data = productUpdateSchema.parse(body);

    const { specs, ...rest } = data;
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        specs: specs ? {
          deleteMany: {},
          create: specs
        } : undefined
      } as any,
      include: {
        brand: true,
        category: true,
        images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
        variants: { include: { inventory: true } },
        specs: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return res.json({ product });
  } catch (error: any) {
    console.error('[Admin PATCH /products/:id] Error:', JSON.stringify(error?.errors || error?.message || error));
    
    if (error instanceof z.ZodError) {
      const details = error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ');
      return res.status(400).json({ error: 'Validation failed', details });
    }
    
    return res.status(400).json({ 
      error: 'Failed to update product', 
      details: error?.message || 'Unknown error' 
    });
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
    const files = (req.files as any[]) || [];

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
      url: file.path || file.secure_url,
      altText: product.name,
      isPrimary: product.images.length === 0 && index === 0,
      sortOrder: product.images.length + index,
    }));

    try {
      await prisma.productImage.createMany({
        data: imageData,
      });
    } catch (dbError: any) {
      throw new Error(`Database persistence failed: ${dbError.message}`);
    }

    const updatedImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });

    return res.status(201).json({ images: updatedImages });
  } catch (error: any) {
    console.error('Upload Process Failure:', error);
    return res.status(error.status || 500).json({
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

adminRoutes.patch('/products/:productId/images/reorder', async (req, res) => {
  try {
    const { productId } = req.params;
    const { imageIds } = req.body;

    if (!Array.isArray(imageIds) || imageIds.length === 0) {
      return res.status(400).json({ error: 'imageIds must be a non-empty array' });
    }

    // Verify all images belong to this product before reordering
    const existingImages = await prisma.productImage.findMany({
      where: { id: { in: imageIds }, productId },
      select: { id: true },
    });

    if (existingImages.length !== imageIds.length) {
      return res.status(400).json({ error: 'Some image IDs do not belong to this product' });
    }

    // Use updateMany per id — compound { id, productId } is NOT a unique key in Prisma
    await prisma.$transaction(
      imageIds.map((id: string, index: number) =>
        prisma.productImage.updateMany({
          where: { id, productId },
          data: { sortOrder: index },
        })
      )
    );

    const updatedImages = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { sortOrder: 'asc' },
    });

    return res.json({ images: updatedImages });
  } catch (error: any) {
    console.error('[Admin] Image Reorder Error:', error);
    return res.status(500).json({ 
      error: 'Failed to reorder images', 
      details: error.message 
    });
  }
});

// ─── Product Variants & Inventory ─────────────────────────────────────────────
const variantCreateSchema = z.object({
  productId: z.string(),
  sku: z.string().min(1),
  name: z.string().min(1),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().optional().nullable(),
  color: z.string().optional().nullable(),
  size: z.string().optional().nullable(),
  model: z.string().optional().nullable(),
  isDefault: z.boolean().default(false),
  attributes: z.record(z.any()).default({}),
  imageUrl: z.string().url().optional().nullable(),
  isActive: z.boolean().default(true),
  quantity: z.number().int().min(0).default(0),
  lowStockThreshold: z.number().int().min(0).default(5),
});

const variantUpdateSchema = variantCreateSchema.partial();

adminRoutes.post('/variants', validate(variantCreateSchema), async (req: any, res) => {
  try {
    const data = variantCreateSchema.parse(req.body);

    const variant = await prisma.$transaction(async (tx) => {
      // If this is set as default, unset others for this product
      if (data.isDefault) {
        await tx.productVariant.updateMany({
          where: { productId: data.productId },
          data: { isDefault: false },
        });
      }

      const createdVariant = await tx.productVariant.create({
        data: {
          productId: data.productId,
          sku: data.sku,
          name: data.name,
          price: data.price,
          comparePrice: data.comparePrice,
          color: data.color,
          size: data.size,
          model: data.model,
          isDefault: data.isDefault,
          attributes: data.attributes,
          imageUrl: data.imageUrl,
          isActive: data.isActive,
        } as any,
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
  } catch (error: any) {
    console.error('[Admin API] Variant creation error:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    return res.status(500).json({ error: 'Failed to create variant', details: error.message });
  }
});

adminRoutes.patch('/variants/:id', validate(variantUpdateSchema), async (req: any, res) => {
  try {
    const { quantity, lowStockThreshold, ...variantData } = req.body;

    const variant = await prisma.$transaction(async (tx) => {
      const current = await tx.productVariant.findUnique({ where: { id: req.params.id } });
      if (!current) throw new Error('Variant not found');

      // If updating to default, unset others
      if (variantData.isDefault) {
        await tx.productVariant.updateMany({
          where: { productId: current.productId },
          data: { isDefault: false },
        });
      }

      const updated = await tx.productVariant.update({
        where: { id: req.params.id },
        data: variantData as any,
      });

      if (quantity !== undefined || lowStockThreshold !== undefined) {
        await tx.inventory.update({
          where: { variantId: req.params.id },
          data: {
            ...(quantity !== undefined && { quantity }),
            ...(lowStockThreshold !== undefined && { lowStockThreshold }),
          },
        });
      }

      return updated;
    });

    const variantWithInventory = await prisma.productVariant.findUnique({
      where: { id: variant.id },
      include: { inventory: true, product: true },
    });

    return res.json({ variant: variantWithInventory });
  } catch (error: any) {
    console.error('[Admin API] Variant update error:', error);
    return res.status(404).json({ error: error.message || 'Variant update failed' });
  }
});

adminRoutes.delete('/variants/:id', async (req, res) => {
  try {
    const variantId = req.params.id;
    
    // Check if it's the last variant (cannot delete last variant)
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: { include: { _count: { select: { variants: true } } } } }
    });

    if (!variant) return res.status(404).json({ error: 'Variant not found' });
    if (variant.product._count.variants <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last variant of a product' });
    }

    await prisma.productVariant.delete({
      where: { id: variantId }
    });

    // If we deleted the default variant, pick a new default
    if (variant.isDefault) {
      const nextVariant = await prisma.productVariant.findFirst({
        where: { productId: variant.productId }
      });
      if (nextVariant) {
        await prisma.productVariant.update({
          where: { id: nextVariant.id },
          data: { isDefault: true }
        });
      }
    }

    return res.json({ message: 'Variant deleted successfully' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to delete variant', details: error.message });
  }
});

adminRoutes.patch('/inventory/:variantId', validate(inventoryUpdateSchema), async (req: any, res) => {
  const { quantity, operation = 'set' } = req.body;

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
adminRoutes.patch('/orders/:id/status', validate(orderStatusSchema), async (req: any, res) => {
  const { status } = req.body;

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