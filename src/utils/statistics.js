export const calculateWinRate = (wins, losses) => {
  const total = wins + losses;
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
};

export const getRecentMatches = (matches, playerName, limit = 5) =>
  matches
    .filter((match) => match.player1 === playerName || match.player2 === playerName)
    .slice(-limit)
    .reverse();

export const getPlayerStats = (matches, playerName) => {
  const playerMatches = matches.filter((match) => match.player1 === playerName || match.player2 === playerName);
  const wins = playerMatches.filter((match) => match.winner === playerName).length;
  const losses = playerMatches.length - wins;
  return { wins, losses, total: playerMatches.length };
};

export const getRecentForm = (matches, playerName, limit = 5) =>
  getRecentMatches(matches, playerName, limit).map((match) => (match.winner === playerName ? 'W' : 'L'));

export const getHeadToHead = (matches, playerA, playerB) => {
  const relevantMatches = matches.filter(
    (match) =>
      (match.player1 === playerA && match.player2 === playerB) ||
      (match.player1 === playerB && match.player2 === playerA)
  );

  return relevantMatches.reduce(
    (summary, match) => {
      if (match.winner === playerA) summary[playerA] += 1;
      if (match.winner === playerB) summary[playerB] += 1;
      return summary;
    },
    { [playerA]: 0, [playerB]: 0, total: relevantMatches.length }
  );
};

export const getTopPerformer = (players) =>
  [...players].sort((a, b) => b.rankPoints - a.rankPoints || b.wins - a.wins)[0] || null;
