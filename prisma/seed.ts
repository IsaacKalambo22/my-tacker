import 'dotenv/config';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore — Prisma v7 re-exports PrismaClient via @prisma/client at runtime; tsc resolves fine
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting seed...');

  // Create admin user
  const hashedPassword = await hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@techtracker.com' },
    update: { 
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    },
    create: {
      email: 'admin@techtracker.com',
      password: hashedPassword,
      name: 'Admin User',
      role: 'ADMIN',
    } as any,
  });

  console.log('✅ Admin user created:', admin.email);
  console.log('🔑 Password: admin123');

  // Create additional test users
  const testUsers = [
    { email: 'user@test.com', password: 'user123', name: 'Test User', role: 'LEARNER' },
    { email: 'demo@example.com', password: 'demo123', name: 'Demo User', role: 'MANAGER' },
    { email: 'john@example.com', password: 'john123', name: 'John Doe', role: 'LEARNER' },
  ];

  for (const userData of testUsers) {
    const hashedPassword = await hash(userData.password, 10);
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: { password: hashedPassword },
      create: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        role: userData.role as any,
      } as any,
    });
    console.log('✅ Test user created:', user.email);
  }

  // Create sample subject
  const subject = await prisma.subject.create({
    data: {
      name: 'Next.js 16 Learning',
      priority: 'High',
      targetDate: new Date('2026-06-30'),
      userId: admin.id,
      phases: {
        create: [
          {
            name: 'Fundamentals',
            order: 0,
            tasks: {
              create: [
                { text: 'Learn App Router basics', order: 0 },
                { text: 'Understand Server Components', order: 1 },
                { text: 'Master Client Components', order: 2 },
              ],
            },
          },
          {
            name: 'Data Fetching',
            order: 1,
            tasks: {
              create: [
                { text: 'Learn Server Actions', order: 0 },
                { text: 'Use React Query', order: 1 },
                { text: 'Implement caching', order: 2 },
              ],
            },
          },
          {
            name: 'Authentication',
            order: 2,
            tasks: {
              create: [
                { text: 'Setup NextAuth v5', order: 0 },
                { text: 'Implement JWT sessions', order: 1 },
                { text: 'Add OAuth providers', order: 2 },
              ],
            },
          },
          {
            name: 'Deployment',
            order: 3,
            tasks: {
              create: [
                { text: 'Configure Vercel', order: 0 },
                { text: 'Setup environment variables', order: 1 },
                { text: 'Deploy application', order: 2 },
              ],
            },
          },
          {
            name: 'Advanced Topics',
            order: 4,
            tasks: {
              create: [
                { text: 'Learn Server-Side Rendering', order: 0 },
                { text: 'Implement API routes', order: 1 },
                { text: 'Optimize performance', order: 2 },
              ],
            },
          },
        ],
      },
    },
  });

  console.log('✅ Sample subject created:', subject.name);

  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
