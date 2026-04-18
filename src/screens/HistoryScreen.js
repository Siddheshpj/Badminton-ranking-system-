import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getMatches } from '../utils/dataManager';

const formatDate = (isoDate) => {
  const date = new Date(isoDate);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
};

export default function HistoryScreen() {
  const [matches, setMatches] = useState([]);

  const loadMatches = async () => {
    const history = await getMatches();
    const sorted = [...history].sort((a, b) => new Date(b.date) - new Date(a.date));
    setMatches(sorted);
  };

  useFocusEffect(
    React.useCallback(() => {
      loadMatches();
    }, [])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.matchup}>
        {item.player1} ({item.player1Score}) vs {item.player2} ({item.player2Score})
      </Text>
      <Text style={styles.winner}>Winner: {item.winner}</Text>
      <Text style={styles.change}>
        {item.player1}: {item.pointChangeByPlayer?.[item.player1] >= 0 ? '+' : ''}
        {item.pointChangeByPlayer?.[item.player1] ?? 0} | {item.player2}:{' '}
        {item.pointChangeByPlayer?.[item.player2] >= 0 ? '+' : ''}
        {item.pointChangeByPlayer?.[item.player2] ?? 0}
      </Text>
      <Text style={styles.date}>{formatDate(item.date)}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {matches.length === 0 ? (
        <Text style={styles.empty}>No matches recorded yet.</Text>
      ) : (
        <FlatList
          data={matches}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16 },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  matchup: { fontSize: 15, fontWeight: '700', color: '#111' },
  winner: { fontSize: 13, color: '#007AFF', marginTop: 6 },
  change: { fontSize: 13, color: '#444', marginTop: 4 },
  date: { fontSize: 12, color: '#888', marginTop: 8 },
  empty: { textAlign: 'center', marginTop: 40, color: '#777', fontSize: 15 },
});
