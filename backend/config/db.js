// db.js
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

/**
 * Avoid creating multiple instances of PrismaClient in development
 * (due to hot reloading in tools like Next.js, Nodemon, etc.)
 */
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'info', 'warn', 'error'], // optional: helpful during dev
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
