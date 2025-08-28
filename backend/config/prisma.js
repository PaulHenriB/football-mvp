const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

prisma.$connect()
  .then(() => console.log("✅ Connected to PostgreSQL via Prisma"))
  .catch(err => {
    console.error("❌ Prisma connection error:", err.message || err);
    process.exit(1);
  });

module.exports = { prisma };
