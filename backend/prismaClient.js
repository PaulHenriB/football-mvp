// backend/prismaClient.js
const { PrismaClient } = require('@prisma/client');

// Instantiate a single Prisma Client for the app
const prisma = new PrismaClient();

// Optional: log queries for debugging
// prisma.$on('query', (e) => {
//   console.log('Query: ' + e.query);
// });

module.exports = prisma;
