const { PrismaClient } = require('@prisma/client');
const { balanceTeams, strictBalanceTeams } = require('../utils/teamBalancer');

const prisma = new PrismaClient();

(async () => {
  try {
    console.log("🔍 Fetching players from DB...");
    const players = await prisma.player.findMany({
      select: { id: true, name: true, rating: true }
    });

    if (players.length < 2) {
      console.error("❌ Not enough players in DB to test team balancing. Please seed the DB.");
      process.exit(1);
    }

    console.log("\n=== DB Players ===");
    players.forEach(p => console.log(`${p.name} (Rating: ${p.rating})`));

    // Test the simple balance
    const simpleTeams = balanceTeams(players);
    console.log("\n=== Simple Balance Result ===");
    console.log("Team A:", simpleTeams.teamA.map(p => `${p.name} (${p.rating})`));
    console.log("Team B:", simpleTeams.teamB.map(p => `${p.name} (${p.rating})`));

    // Test the strict balance
    const strictTeams = strictBalanceTeams(players);
    console.log("\n=== Strict Balance Result ===");
    console.log("Team A:", strictTeams.teamA.map(p => `${p.name} (${p.rating})`));
    console.log("Team B:", strictTeams.teamB.map(p => `${p.name} (${p.rating})`));

    process.exit(0); // ✅ Clean exit
  } catch (err) {
    console.error("❌ Test failed:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
