import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Inspecting users...');
  const users = await prisma.user.findMany({ select: { email: true, createdAt: true, role: true } });
  console.log('--- Current Users ---');
  console.log(JSON.stringify(users, null, 2));
  console.log('----------------------');
}

main();
