import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Starting Backfill of Product Variants and Inventory ---');

  // Fetch all products with their variants and inventory records
  const products = await prisma.product.findMany({
    include: {
      variants: {
        include: {
          inventory: true
        }
      }
    }
  });

  console.log(`Found ${products.length} products to check.`);

  let stats = {
    productsChecked: 0,
    variantsCreated: 0,
    inventoryCreated: 0,
    skipped: 0
  };

  for (const product of products) {
    stats.productsChecked++;
    
    try {
      await prisma.$transaction(async (tx) => {
        // 1. If product has no variants, create a default "Standard" variant
        if (product.variants.length === 0) {
          console.log(`Product [${product.name}] has no variants. Creating default...`);
          
          const skuBase = product.slug.replace(/[^a-z0-9-]/g, '').substring(0, 40);
          const defaultVariant = await tx.productVariant.create({
            data: {
              productId: product.id,
              sku: `${skuBase}-default`,
              name: 'Standard',
              price: product.basePrice,
              isActive: true,
            },
          });
          
          stats.variantsCreated++;

          // Create inventory for this new variant
          await tx.inventory.create({
            data: {
              variantId: defaultVariant.id,
              quantity: 0,
              lowStockThreshold: 5,
            },
          });
          
          stats.inventoryCreated++;
        } else {
          // 2. If it has variants, make sure each one has an inventory record
          for (const variant of product.variants) {
            if (!variant.inventory) {
              console.log(`Variant [${variant.name}] of product [${product.name}] has no inventory record. Creating...`);
              
              await tx.inventory.create({
                data: {
                  variantId: variant.id,
                  quantity: 0,
                  lowStockThreshold: 5,
                },
              });
              
              stats.inventoryCreated++;
            } else {
              // Both variant and inventory exist
              stats.skipped++;
            }
          }
        }
      });
    } catch (error) {
      console.error(`Error processing product [${product.name}]:`, error);
    }
  }

  console.log('\n--- Backfill Summary ---');
  console.log(`Products Checked: ${stats.productsChecked}`);
  console.log(`Variants Created: ${stats.variantsCreated}`);
  console.log(`Inventory Rows Created: ${stats.inventoryCreated}`);
  console.log(`Already Sufficient (Skipped): ${stats.skipped}`);
  console.log('--- Backfill Completed ---');
}

main()
  .catch((e) => {
    console.error('Fatal error during backfill:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
