import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYERS_KEY = 'badminton_players';
const MATCHES_KEY = 'badminton_matches';

const PLAYERS = ['Piyush', 'Siddhesh', 'Sanskar'];
const INITIAL_POINTS = 60;

const buildInitialPlayers = () =>
  PLAYERS.map((name) => ({
    name,
    rankPoints: INITIAL_POINTS,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    streakType: null,
  }));

export const initializeApp = async () => {
  try {
    const existingPlayers = await AsyncStorage.getItem(PLAYERS_KEY);
    const existingMatches = await AsyncStorage.getItem(MATCHES_KEY);

    if (!existingPlayers) {
      await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(buildInitialPlayers()));
    }

    if (!existingMatches) {
      await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify([]));
    }
  } catch (error) {
    console.error('Error initializing app:', error);
  }
};

export const getPlayers = async () => {
  try {
    const data = await AsyncStorage.getItem(PLAYERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting players:', error);
    return [];
  }
};

export const savePlayers = async (players) => {
  try {
    await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
  } catch (error) {
    console.error('Error saving players:', error);
  }
};

export const updatePlayer = async (playerName, updates) => {
  try {
    const players = await getPlayers();
    const index = players.findIndex((player) => player.name === playerName);

    if (index !== -1) {
      players[index] = { ...players[index], ...updates };
      await savePlayers(players);
    }
  } catch (error) {
    console.error('Error updating player:', error);
  }
};

export const getMatches = async () => {
  try {
    const data = await AsyncStorage.getItem(MATCHES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting matches:', error);
    return [];
  }
};

export const saveMatch = async (matchData) => {
  try {
    const matches = await getMatches();
    const newMatch = {
      ...matchData,
      id: Date.now(),
      date: new Date().toISOString(),
    };

    matches.push(newMatch);
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
    return newMatch;
  } catch (error) {
    console.error('Error saving match:', error);
    return null;
  }
};

export const getRankTitle = (points) => {
  if (points >= 270) return 'Legend';
  if (points >= 210) return 'Titan';
  if (points >= 160) return 'Phantom';
  if (points >= 120) return 'Ace';
  if (points >= 80) return 'Elite';
  if (points >= 50) return 'Challenger';
  return 'Rookie';
};

export const calculatePointChange = (winMargin) => Math.min(Math.max(Math.abs(winMargin), 1), 10);

const nextStreak = (player, didWin) => {
  const streakType = didWin ? 'win' : 'loss';
  const currentStreak = player.streakType === streakType ? player.currentStreak + 1 : 1;
  return { streakType, currentStreak };
};

const streakBonus = ({ streakType, currentStreak }) => {
  if (currentStreak > 0 && currentStreak % 3 === 0) {
    return streakType === 'win' ? 10 : -10;
  }

  return 0;
};

export const recordMatchResult = async ({ player1, player2, player1Score, player2Score }) => {
  const p1Score = Number(player1Score);
  const p2Score = Number(player2Score);

  if (Number.isNaN(p1Score) || Number.isNaN(p2Score)) {
    throw new Error('Please enter valid numeric scores.');
  }

  if (p1Score === p2Score) {
    throw new Error('Match cannot end in a tie.');
  }

  const players = await getPlayers();
  const player1Data = players.find((player) => player.name === player1);
  const player2Data = players.find((player) => player.name === player2);

  if (!player1Data || !player2Data) {
    throw new Error('Player data not found. Please re-open the app.');
  }

  const winner = p1Score > p2Score ? player1 : player2;
  const loser = winner === player1 ? player2 : player1;
  const margin = Math.abs(p1Score - p2Score);
  const pointsChanged = calculatePointChange(margin);

  const p1Won = winner === player1;
  const p2Won = winner === player2;

  const p1Streak = nextStreak(player1Data, p1Won);
  const p2Streak = nextStreak(player2Data, p2Won);

  const p1StreakBonus = streakBonus(p1Streak);
  const p2StreakBonus = streakBonus(p2Streak);

  const p1Base = p1Won ? pointsChanged : -pointsChanged;
  const p2Base = p2Won ? pointsChanged : -pointsChanged;

  const updatedPlayer1 = {
    ...player1Data,
    rankPoints: Math.max(0, player1Data.rankPoints + p1Base + p1StreakBonus),
    wins: p1Won ? player1Data.wins + 1 : player1Data.wins,
    losses: p1Won ? player1Data.losses : player1Data.losses + 1,
    ...p1Streak,
  };

  const updatedPlayer2 = {
    ...player2Data,
    rankPoints: Math.max(0, player2Data.rankPoints + p2Base + p2StreakBonus),
    wins: p2Won ? player2Data.wins + 1 : player2Data.wins,
    losses: p2Won ? player2Data.losses : player2Data.losses + 1,
    ...p2Streak,
  };

  const updatedPlayers = players.map((player) => {
    if (player.name === player1) return updatedPlayer1;
    if (player.name === player2) return updatedPlayer2;
    return player;
  });

  await savePlayers(updatedPlayers);

  const savedMatch = await saveMatch({
    player1,
    player2,
    player1Score: p1Score,
    player2Score: p2Score,
    winner,
    loser,
    margin,
    pointsChanged,
    pointChangeByPlayer: {
      [player1]: p1Base + p1StreakBonus,
      [player2]: p2Base + p2StreakBonus,
    },
    streakBonusByPlayer: {
      [player1]: p1StreakBonus,
      [player2]: p2StreakBonus,
    },
  });

  return {
    winner,
    loser,
    pointsChanged,
    margin,
    match: savedMatch,
    players: updatedPlayers,
  };
};
