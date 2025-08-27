// /utils/teamBalancer.js
/**
* Simple team balancing algorithm
* - Sorts players by rating (highest first)
* - Alternates assignment into two teams
* - Attempts to balance both rating and position spread
*/
exports.balanceTeams = (players) => {
if (!players || players.length < 2) {
return { teamA: [], teamB: [] };
}


// Sort players by rating descending
const sorted = [...players].sort((a, b) => b.rating - a.rating);


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


// Optional: rebalance by position if one team lacks a GK
const ensureGoalkeeper = (team, fallbackTeam) => {
const hasGK = team.some(p => p.position === 'GOALKEEPER');
if (!hasGK) {
const gkIndex = fallbackTeam.findIndex(p => p.position === 'GOALKEEPER');
if (gkIndex !== -1) {
const [gk] = fallbackTeam.splice(gkIndex, 1);
team.push(gk);
}
}
};


ensureGoalkeeper(teamA, teamB);
ensureGoalkeeper(teamB, teamA);


return { teamA, teamB };
};
