import { hash } from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_SEED_EMAIL || 'admin@jorbex.com';
  const password = process.env.ADMIN_SEED_PASSWORD || 'Admin@Jorbex2026!';
  const hashed = await hash(password, 12);

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      name: 'Super Admin',
      email,
      password: hashed,
      isSuperAdmin: true,
    },
  });

  console.log(`Admin seeded: ${email}`);
  console.log(`   Password: ${password}`);
  console.log(`   Change this password immediately after first login!`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
