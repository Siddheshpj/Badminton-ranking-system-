import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getPlayers, getRankTitle } from '../utils/dataManager';

export default function LeaderboardScreen() {
  const [players, setPlayers] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadLeaderboard = async () => {
    try {
      const data = await getPlayers();
      const sorted = [...data].sort((a, b) => b.rankPoints - a.rankPoints || b.wins - a.wins);
      setPlayers(sorted);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadLeaderboard();
    }, [])
  );

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadLeaderboard();
    setRefreshing(false);
  }, []);

  const renderPlayer = ({ item, index }) => (
    <View style={styles.playerCard}>
      <Text style={styles.rank}>#{index + 1}</Text>
      <View style={styles.playerInfo}>
        <Text style={styles.playerName}>{item.name}</Text>
        <Text style={styles.rankTitle}>{getRankTitle(item.rankPoints)}</Text>
      </View>
      <View style={styles.stats}>
        <Text style={styles.points}>{item.rankPoints} pts</Text>
        <Text style={styles.record}>
          {item.wins}W - {item.losses}L
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={players}
        renderItem={renderPlayer}
        keyExtractor={(item) => item.name}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  listContent: { padding: 16 },
  playerCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  rank: { fontSize: 18, fontWeight: 'bold', color: '#007AFF', marginRight: 12, minWidth: 30 },
  playerInfo: { flex: 1 },
  playerName: { fontSize: 16, fontWeight: 'bold', color: '#000' },
  rankTitle: { fontSize: 12, color: '#666', marginTop: 4 },
  stats: { alignItems: 'flex-end' },
  points: { fontSize: 14, fontWeight: 'bold', color: '#007AFF' },
  record: { fontSize: 12, color: '#999', marginTop: 4 },
});
