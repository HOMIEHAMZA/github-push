import { prisma } from '../lib/prisma';

async function main() {
  const variants = await prisma.productVariant.findMany({
    take: 10,
    include: { inventory: true, product: { select: { name: true } } },
  });

  for (const v of variants) {
    const qty = v.inventory?.quantity ?? 0;
    const reserved = v.inventory?.reservedQty ?? 0;
    console.log(`${v.product.name} | variantId: ${v.id} | inventory: ${v.inventory ? `qty=${qty}, reserved=${reserved}, available=${qty - reserved}` : 'NO INVENTORY RECORD'}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
