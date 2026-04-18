export const calculateWinRate = (wins, losses) => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const getRecentMatches = (matches, playerName, limit = 5) => {
  return matches
    .filter(m => m.player1 === playerName || m.player2 === playerName)
    .slice(-limit)
    .reverse();
};

export const getPlayerStats = (matches, playerName) => {
  const playerMatches = matches.filter(m => m.player1 === playerName || m.player2 === playerName);
  const wins = playerMatches.filter(m => m.winner === playerName).length;
  const losses = playerMatches.length - wins;
  return { wins, losses, total: playerMatches.length };
};
