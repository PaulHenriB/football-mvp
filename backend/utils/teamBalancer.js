exports.balanceTeams = (players) => {
  // Very simple rating sort for now — replace with your logic
  const sorted = [...players].sort((a, b) => b.rating - a.rating);
  const teamA = [], teamB = [];

  sorted.forEach((player, i) => {
    (i % 2 === 0 ? teamA : teamB).push(player);
  });

  return { teamA, teamB };
};
