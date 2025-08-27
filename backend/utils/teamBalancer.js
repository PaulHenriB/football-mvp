// /utils/teamBalancer.js

/**
 * Simple team balancing algorithm
 * - Sorts players by rating (highest first)
 * - Alternates assignment into two teams
 * - Ensures each team has at least one goalkeeper (if available)
 * - Returns team composition + average rating for debug
 */
exports.balanceTeams = (players = []) => {
  if (!Array.isArray(players) || players.length < 2) {
    return { teamA: [], teamB: [] };
  }

  // Ensure players have a rating field (default 0)
  const normalized = players.map((p) => ({
    ...p,
    rating: p.rating || 0,
    position: p.position || "UNKNOWN",
  }));

  // Sort players by rating descending
  const sorted = [...normalized].sort((a, b) => b.rating - a.rating);

  const teamA = [];
  const teamB = [];

  // Alternate players into teams
  sorted.forEach((player, i) => {
    if (i % 2 === 0) {
      teamA.push(player);
    } else {
      teamB.push(player);
    }
  });

  // Helper: Ensure each team has a GK
  const ensureGoalkeeper = (team, fallbackTeam) => {
    const hasGK = team.some((p) => p.position === "GOALKEEPER");
    if (!hasGK) {
      const gkIndex = fallbackTeam.findIndex(
        (p) => p.position === "GOALKEEPER"
      );
      if (gkIndex !== -1) {
        const [gk] = fallbackTeam.splice(gkIndex, 1);
        team.push(gk);
      }
    }
  };

  ensureGoalkeeper(teamA, teamB);
  ensureGoalkeeper(teamB, teamA);

  // Calculate team averages for reference
  const avgRating = (team) =>
    team.length > 0
      ? (team.reduce((sum, p) => sum + (p.rating || 0), 0) / team.length).toFixed(2)
      : "0.00";

  return {
    teamA,
    teamB,
    stats: {
      teamA_avg: avgRating(teamA),
      teamB_avg: avgRating(teamB),
    },
  };
};
