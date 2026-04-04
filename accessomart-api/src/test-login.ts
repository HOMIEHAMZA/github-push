import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testLogin() {
  const email = 'admin@accessomart.com';
  const password = 'Admin123!';

  console.log(`Testing login for ${email}...`);
  const user = await prisma.user.findUnique({ where: { email } });
  
  if (!user) {
    console.error('User not found in DB!');
    return;
  }

  console.log('User found. isActive:', user.isActive);
  const valid = await bcrypt.compare(password, user.passwordHash);
  console.log('Password valid:', valid);
  
  if (valid && user.isActive) {
    console.log('✅ Login SUCCESS simulation');
  } else {
    console.log('❌ Login FAILED simulation');
  }
}

testLogin().finally(() => prisma.$disconnect());
