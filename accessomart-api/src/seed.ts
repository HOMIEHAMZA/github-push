import { PrismaClient, UserRole, OrderStatus, ProductStatus, PaymentProvider, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // 1. Clean up existing data manually (Reverse dependency order to avoid foreign key violations)
  console.log('🧹 Cleaning up old data...');
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log('👤 Seeding users...');
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const userPassword = await bcrypt.hash('User123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@accessomart.com',
      passwordHash: hashedPassword,
      firstName: 'System',
      lastName: 'Admin',
      role: UserRole.ADMIN,
    },
  });

  const customer = await prisma.user.create({
    data: {
      email: 'user@accessomart.com',
      passwordHash: userPassword,
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.CUSTOMER,
    },
  });

  // 3. Seed Catalog (Brands & Categories)
  console.log('🏷️ Seeding brands...');
  const logitech = await prisma.brand.create({ data: { name: 'Logitech G', slug: 'logitech-g' } });
  const razer = await prisma.brand.create({ data: { name: 'Razer', slug: 'razer' } });
  const asus = await prisma.brand.create({ data: { name: 'ASUS ROG', slug: 'asus-rog' } });
  const corsair = await prisma.brand.create({ data: { name: 'Corsair', slug: 'corsair' } });

  console.log('📂 Seeding categories...');
  const peripherals = await prisma.category.create({ data: { name: 'Peripherals', slug: 'peripherals' } });
  const mice = await prisma.category.create({ data: { name: 'Gaming Mice', slug: 'gaming-mice', parentId: peripherals.id } });
  const keyboards = await prisma.category.create({ data: { name: 'Keyboards', slug: 'keyboards', parentId: peripherals.id } });
  const monitors = await prisma.category.create({ data: { name: 'Monitors', slug: 'monitors' } });

  // 4. Seed Products
  console.log('📦 Seeding products, variants, and images...');
  const productsData = [
    {
      name: 'Logitech G Pro X Superlight 2',
      slug: 'logitech-g-pro-x-superlight-2',
      brandId: logitech.id,
      categoryId: mice.id,
      basePrice: 159.99,
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?q=80&w=800&auto=format&fit=crop', isPrimary: true }
      ],
      variants: [
        { sku: 'LOG-PRO-X-BLK', name: 'Black', price: 159.99, attributes: { color: 'Black' }, stock: 50 },
        { sku: 'LOG-PRO-X-WHT', name: 'White', price: 159.99, attributes: { color: 'White' }, stock: 30 },
      ],
    },
    {
      name: 'ASUS ROG Swift OLED PG27AQDM',
      slug: 'asus-rog-swift-oled',
      brandId: asus.id,
      categoryId: monitors.id,
      basePrice: 999.00,
      isFeatured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1552831388-6a0b3575b32a?q=80&w=800&auto=format&fit=crop', isPrimary: true }
      ],
      variants: [
        { sku: 'ROG-OLED-27', name: '27 inch OLED', price: 999.00, attributes: { display: 'OLED' }, stock: 5 },
      ],
    },
    {
      name: 'Razer BlackWidow V4 Pro',
      slug: 'razer-blackwidow-v4-pro',
      brandId: razer.id,
      categoryId: keyboards.id,
      basePrice: 229.99,
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1629134107147-195fd024823a?q=80&w=800&auto=format&fit=crop', isPrimary: true }
      ],
      variants: [
        { sku: 'RZ-BWV4-GRN', name: 'Green Switch', price: 229.99, attributes: { switch: 'Green' }, stock: 12 },
      ],
    },
    {
      name: 'Razer Viper V2 Pro',
      slug: 'razer-viper-v2-pro',
      brandId: razer.id,
      categoryId: mice.id,
      basePrice: 149.99,
      isFeatured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1527735095040-1ec7e651253d?q=80&w=800&auto=format&fit=crop', isPrimary: true }
      ],
      variants: [
        { sku: 'RZ-VIPER-V2', name: 'Black', price: 149.99, attributes: { color: 'Black' }, stock: 2 },
      ],
    }
  ];

  for (const pData of productsData) {
    const product = await prisma.product.create({
      data: {
        name: pData.name,
        slug: pData.slug,
        brandId: pData.brandId,
        categoryId: pData.categoryId,
        basePrice: pData.basePrice,
        status: ProductStatus.ACTIVE,
        isFeatured: pData.isFeatured,
        images: {
          create: pData.images.map((img, index) => ({
            url: img.url,
            isPrimary: img.isPrimary,
            sortOrder: index,
          })),
        },
      },
      include: {
        images: true
      }
    });

    for (let i = 0; i < pData.variants.length; i++) {
      const vData = pData.variants[i];
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: vData.sku,
          name: vData.name,
          price: vData.price,
          attributes: vData.attributes,
          isActive: true,
          imageUrl: product.images.find(img => img.isPrimary)?.url || product.images[0]?.url,
          isDefault: i === 0,
          color: (vData.attributes as any).color || null,
          size: (vData.attributes as any).size || null,
          model: (vData.attributes as any).model || null,
        }
      });

      await prisma.inventory.create({
        data: {
          variantId: variant.id,
          quantity: vData.stock,
          reservedQty: 0,
          lowStockThreshold: 5,
        }
      });
    }
  }

  // 5. Seed Orders
  console.log('💳 Seeding orders...');
  const mouseVariant = await prisma.productVariant.findFirst({ where: { sku: 'LOG-PRO-X-BLK' }, include: { product: true } });
  const monitorVariant = await prisma.productVariant.findFirst({ where: { sku: 'ROG-OLED-27' }, include: { product: true } });

  if (mouseVariant && monitorVariant) {
    // Order 1: Pending (Mouse x2)
    const o1Total = 159.99 * 2;
    await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber: 'ORD-2024-001',
        status: OrderStatus.PENDING,
        subtotal: o1Total,
        total: o1Total,
        items: {
          create: {
            variantId: mouseVariant.id,
            quantity: 2,
            unitPrice: mouseVariant.price,
            totalPrice: o1Total,
            productName: mouseVariant.product.name,
            variantName: mouseVariant.name,
            imageUrl: mouseVariant.imageUrl,
          }
        },
        payment: {
          create: {
            amount: o1Total,
            provider: PaymentProvider.STRIPE,
            status: PaymentStatus.PENDING,
          }
        }
      }
    });

    // Order 2: Shipped (Monitor x1)
    const o2Total = 999.00;
    await prisma.order.create({
      data: {
        userId: customer.id,
        orderNumber: 'ORD-2024-002',
        status: OrderStatus.SHIPPED,
        subtotal: o2Total,
        total: o2Total,
        items: {
          create: {
            variantId: monitorVariant.id,
            quantity: 1,
            unitPrice: monitorVariant.price,
            totalPrice: o2Total,
            productName: monitorVariant.product.name,
            variantName: monitorVariant.name,
            imageUrl: monitorVariant.imageUrl,
          }
        },
        payment: {
          create: {
            amount: o2Total,
            provider: PaymentProvider.STRIPE,
            status: PaymentStatus.CAPTURED,
            paidAt: new Date(),
          }
        }
      }
    });

    console.log('✅ Seeding complete with all metrics!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
