import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMatches, getPlayers } from '../utils/dataManager';
import { getHeadToHead, getTopPerformer } from '../utils/statistics';

const PAIRS = [
  ['Piyush', 'Siddhesh'],
  ['Sanskar', 'Piyush'],
  ['Sanskar', 'Siddhesh'],
];

export default function StatsScreen() {
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

  const topPlayer = useMemo(() => getTopPerformer(players), [players]);
  const totalMatches = matches.length;
  const totalPointsInPool = players.reduce((sum, player) => sum + player.rankPoints, 0);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.title}>Overall Stats</Text>
        <Text style={styles.line}>Total Matches: {totalMatches}</Text>
        <Text style={styles.line}>Total Points in System: {totalPointsInPool}</Text>
        <Text style={styles.line}>Current Leader: {topPlayer ? topPlayer.name : 'N/A'}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Head-to-Head</Text>
        {PAIRS.map(([playerA, playerB]) => {
          const summary = getHeadToHead(matches, playerA, playerB);
          return (
            <Text key={`${playerA}-${playerB}`} style={styles.line}>
              {playerA} vs {playerB}: {summary[playerA]} - {summary[playerB]}
            </Text>
          );
        })}
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Recent Trend (Last 5 Matches)</Text>
        {matches.slice(-5).reverse().map((match) => (
          <Text key={match.id} style={styles.line}>
            {match.winner} beat {match.winner === match.player1 ? match.player2 : match.player1}
          </Text>
        ))}
        {totalMatches === 0 && <Text style={styles.line}>No match trends yet.</Text>}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: '700', marginBottom: 10, color: '#111' },
  line: { fontSize: 14, color: '#333', marginBottom: 6 },
});
