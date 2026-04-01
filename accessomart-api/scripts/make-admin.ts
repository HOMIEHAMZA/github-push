import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'admin@accessomart.com';
  const password = process.argv[3] || 'AdminPassword123!';

  console.log(`Checking user: ${email}...`);

  let user = await prisma.user.findUnique({
    where: { email }
  });

  if (user) {
    console.log(`User found. Updating password and promoting to ADMIN...`);
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { email },
      data: { role: 'ADMIN', passwordHash }
    });
    console.log(`Success: ${email} updated and is now an ADMIN.`);
  } else {
    console.log(`User not found. Creating ADMIN user...`);
    const passwordHash = await bcrypt.hash(password, 10);
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName: 'System',
        lastName: 'Administrator',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
      }
    });
    console.log(`Success: Created ADMIN user with email ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
