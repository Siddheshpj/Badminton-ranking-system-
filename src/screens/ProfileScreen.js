import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMatches, getPlayers, getRankTitle } from '../utils/dataManager';
import { calculateWinRate, getPlayerStats, getRecentForm } from '../utils/statistics';

const PLAYER_NAMES = ['Piyush', 'Siddhesh', 'Sanskar'];

export default function ProfileScreen() {
  const [selectedPlayer, setSelectedPlayer] = useState('Piyush');
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  const loadData = async () => {
    const [playerData, matchData] = await Promise.all([getPlayers(), getMatches()]);
    setPlayers(playerData);
    setMatches(matchData);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [])
  );

  const profile = useMemo(() => players.find((player) => player.name === selectedPlayer), [players, selectedPlayer]);
  const stats = useMemo(() => getPlayerStats(matches, selectedPlayer), [matches, selectedPlayer]);
  const winRate = calculateWinRate(stats.wins, stats.losses);
  const recentForm = getRecentForm(matches, selectedPlayer, 5);

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  const streakLabel =
    profile.currentStreak > 0 && profile.streakType
      ? `${profile.currentStreak} ${profile.streakType === 'win' ? 'win' : 'loss'} streak`
      : 'No active streak';

  return (
    <View style={styles.container}>
      <View style={styles.selectorRow}>
        {PLAYER_NAMES.map((name) => (
          <TouchableOpacity
            key={name}
            style={[styles.selectorButton, selectedPlayer === name && styles.selectorButtonActive]}
            onPress={() => setSelectedPlayer(name)}
          >
            <Text style={[styles.selectorText, selectedPlayer === name && styles.selectorTextActive]}>{name}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.playerName}>{profile.name}</Text>
        <Text style={styles.rankTitle}>{getRankTitle(profile.rankPoints)}</Text>
        <Text style={styles.bigPoints}>{profile.rankPoints} pts</Text>

        <View style={styles.statsGrid}>
          <Text style={styles.statText}>Wins: {stats.wins}</Text>
          <Text style={styles.statText}>Losses: {stats.losses}</Text>
          <Text style={styles.statText}>Win Rate: {winRate}%</Text>
          <Text style={styles.statText}>Matches: {stats.total}</Text>
        </View>

        <Text style={styles.streak}>{streakLabel}</Text>

        <Text style={styles.sectionTitle}>Recent Form (Last 5)</Text>
        <View style={styles.formRow}>
          {recentForm.length === 0 ? (
            <Text style={styles.noData}>No matches yet</Text>
          ) : (
            recentForm.map((result, index) => (
              <View key={`${result}-${index}`} style={[styles.formBadge, result === 'W' ? styles.winBadge : styles.lossBadge]}>
                <Text style={styles.formText}>{result}</Text>
              </View>
            ))
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 16 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: '#666', fontSize: 16 },
  selectorRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  selectorButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#fff',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  selectorButtonActive: { backgroundColor: '#007AFF' },
  selectorText: { color: '#333', fontWeight: '600' },
  selectorTextActive: { color: '#fff' },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  playerName: { fontSize: 24, fontWeight: '700', color: '#111' },
  rankTitle: { marginTop: 4, color: '#666', fontSize: 14 },
  bigPoints: { marginTop: 8, fontSize: 28, fontWeight: '800', color: '#007AFF' },
  statsGrid: { marginTop: 14, gap: 8 },
  statText: { fontSize: 15, color: '#222' },
  streak: { marginTop: 14, color: '#444', fontWeight: '600' },
  sectionTitle: { marginTop: 16, fontSize: 14, fontWeight: '700', color: '#111' },
  formRow: { flexDirection: 'row', marginTop: 8 },
  formBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  winBadge: { backgroundColor: '#27ae60' },
  lossBadge: { backgroundColor: '#e74c3c' },
  formText: { color: '#fff', fontWeight: '700' },
  noData: { color: '#777' },
});
