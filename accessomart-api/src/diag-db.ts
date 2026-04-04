import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Checking database connection...');
  try {
    const userCount = await prisma.user.count();
    const productCount = await prisma.product.count();
    const orderCount = await prisma.order.count();
    const categoriesCount = await prisma.category.count();

    console.log('--- Database Stats ---');
    console.log(`Users: ${userCount}`);
    console.log(`Products: ${productCount}`);
    console.log(`Orders: ${orderCount}`);
    console.log(`Categories: ${categoriesCount}`);
    console.log('----------------------');
    
    if (userCount === 0 && productCount === 0) {
      console.log('WARNING: Essential tables appear empty.');
    } else {
      console.log('Data found in database.');
    }

  } catch (err) {
    console.error('Error connecting to database:', err);
    // Try to list tables directly
    try {
        console.log('Attempting to list tables manually...');
        const tables = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
        console.log('Found tables:', tables);
    } catch (innerErr) {
        console.error('Failed to query tables:', innerErr);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
