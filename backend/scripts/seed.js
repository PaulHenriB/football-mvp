// backend/scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create test users
  const passwordHash = await bcrypt.hash('password123', 10);

  const user1 = await prisma.user.create({
    data: {
      firstName: 'John',
      lastName: 'Doe',
      dob: new Date('1990-01-01'),
      favoriteFoot: 'RIGHT',
      favoritePosition: 'FORWARD',
      phoneNumber: '1234567890',
      email: 'john@example.com',
      passwordHash,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      firstName: 'Alice',
      lastName: 'Smith',
      dob: new Date('1995-05-10'),
      favoriteFoot: 'LEFT',
      favoritePosition: 'MIDFIELDER',
      phoneNumber: '0987654321',
      email: 'alice@example.com',
      passwordHash,
    },
  });

  // 2. Create players
  const players = await prisma.player.createMany({
    data: [
      { name: 'John Player', email: 'john.player@example.com', position: 'FORWARD', rating: 4.5, userId: user1.id },
      { name: 'Alice Player', email: 'alice.player@example.com', position: 'MIDFIELDER', rating: 3.8, userId: user2.id },
      { name: 'Bob Keeper', email: 'bob@example.com', position: 'GOALKEEPER', rating: 4.2 },
      { name: 'Charlie Defender', email: 'charlie@example.com', position: 'DEFENDER', rating: 3.5 },
      { name: 'Diana Mid', email: 'diana@example.com', position: 'MIDFIELDER', rating: 4.0 },
      { name: 'Ethan Striker', email: 'ethan@example.com', position: 'FORWARD', rating: 4.7 },
    ],
  });
  console.log('✅ Players created');

  // 3. Create a match
  const match = await prisma.match.create({
    data: {
      date: new Date(),
      location: 'Central Park',
      duration: 90,
      fee: 5.0,
      createdBy: user1.id,
    },
  });
  console.log('✅ Match created');

  // 4. Assign players to the match
  const allPlayers = await prisma.player.findMany();
  for (let player of allPlayers) {
    await prisma.playerMatch.create({
      data: {
        playerId: player.id,
        matchId: match.id,
        team: 'UNASSIGNED',
      },
    });
  }
  console.log('✅ Players assigned to match');

  // 5. Add some ratings for testing
  await prisma.rating.createMany({
    data: [
      { playerId: allPlayers[0].id, matchId: match.id, score: 4.0, comment: 'Solid performance' },
      { playerId: allPlayers[1].id, matchId: match.id, score: 3.5, comment: 'Decent game' },
      { playerId: allPlayers[2].id, matchId: match.id, score: 4.5, comment: 'Great saves!' },
    ],
  });
  console.log('✅ Ratings added');

  console.log('🌱 Seeding completed!');
}

main()
  .catch((err) => {
    console.error('❌ Seeding error:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

