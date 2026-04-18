import AsyncStorage from '@react-native-async-storage/async-storage';

const PLAYERS_KEY = 'badminton_players';
const MATCHES_KEY = 'badminton_matches';

const PLAYERS = ['Piyush', 'Siddhesh', 'Sanskar'];
const INITIAL_POINTS = 60;

export const initializeApp = async () => {
  try {
    const existingPlayers = await AsyncStorage.getItem(PLAYERS_KEY);
    if (!existingPlayers) {
      const initialPlayers = PLAYERS.map(name => ({
        name,
        rankPoints: INITIAL_POINTS,
        wins: 0,
        losses: 0,
        currentStreak: 0,
        streakType: null,
      }));
      await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(initialPlayers));
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

export const updatePlayer = async (playerName, updates) => {
  try {
    const players = await getPlayers();
    const index = players.findIndex(p => p.name === playerName);
    if (index !== -1) {
      players[index] = { ...players[index], ...updates };
      await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    }
  } catch (error) {
    console.error('Error updating player:', error);
  }
};

export const saveMatch = async (matchData) => {
  try {
    const matches = await getMatches();
    matchData.id = Date.now();
    matchData.date = new Date().toISOString();
    matches.push(matchData);
    await AsyncStorage.setItem(MATCHES_KEY, JSON.stringify(matches));
  } catch (error) {
    console.error('Error saving match:', error);
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

export const getRankTitle = (points) => {
  if (points >= 270) return 'Legend';
  if (points >= 210) return 'Titan';
  if (points >= 160) return 'Phantom';
  if (points >= 120) return 'Ace';
  if (points >= 80) return 'Elite';
  if (points >= 50) return 'Challenger';
  return 'Rookie';
};

export const calculatePointChange = (winMargin) => {
  const change = Math.min(Math.abs(winMargin), 10);
  return change;
};
