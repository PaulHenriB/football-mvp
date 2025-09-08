// backend/utils/teamBalancer.js

/**
 * Balanced team assignment algorithm
 * - Sorts players by rating (highest first)
 * - Alternates assignment into two teams
 * - Ensures each team has at least one goalkeeper (if available)
 * - Returns clean JSON with team composition + averages + difference
 *
 * @param {Array} players - Array of { id, name, rating, position }
 * @returns {Object} { teamA, teamB, summary }
 */
function balanceTeams(players = []) {
  if (!Array.isArray(players) || players.length < 2) {
    throw new Error("Not enough players to balance");
  }

  // Normalize players (ensure rating & position exist)
  const normalized = players.map((p) => ({
    ...p,
    rating: typeof p.rating === "number" ? p.rating : 0,
    position: p.position || "UNKNOWN",
  }));

  // Sort players by rating (descending)
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

  // Helper: Ensure each team has a goalkeeper if possible
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

  // Helper: Compute average rating
  const avgRating = (team) =>
    team.length > 0
      ? team.reduce((sum, p) => sum + (p.rating || 0), 0) / team.length
      : 0;

  const averageRatingA = avgRating(teamA);
  const averageRatingB = avgRating(teamB);

  return {
    teamA,
    teamB,
    summary: {
      averageRatingA: Number(averageRatingA.toFixed(2)),
      averageRatingB: Number(averageRatingB.toFixed(2)),
      difference: Number(
        Math.abs(averageRatingA - averageRatingB).toFixed(2)
      ),
    },
  };
}

module.exports = { balanceTeams };
