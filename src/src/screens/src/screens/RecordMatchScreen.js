import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { getPlayers, updatePlayer, saveMatch, calculatePointChange, getRankTitle } from '../utils/dataManager';

export default function RecordMatchScreen() {
  const [matches, setMatches] = useState([
    { label: 'Piyush vs Siddhesh', player1: 'Piyush', player2: 'Siddhesh' },
    { label: 'Sanskar vs Piyush', player1: 'Sanskar', player2: 'Piyush' },
    { label: 'Sanskar vs Siddhesh', player1: 'Sanskar', player2: 'Siddhesh' },
  ]);
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  const handleRecordMatch = async () => {
    if (!player1Score || !player2Score) {
      Alert.alert('Error', 'Please enter scores for both players');
      return;
    }

    const p1Score = parseInt(player1Score);
    const p2Score = parseInt(player2Score);
    const match = matches[selectedMatch];
    const margin = Math.abs(p1Score - p2Score);
    const pointChange = calculatePointChange(margin);

    const players = await getPlayers();
    const player1 = players.find(p => p.name === match.player1);
    const player2 = players.find(p => p.name === match.player2);

    const winner = p1Score > p2Score ? match.player1 : match.player2;

    const p1PointChange = winner === match.player1 ? pointChange : -pointChange;
    const p2PointChange = winner === match.player2 ? pointChange : -pointChange;

    const newPlayer1Points = Math.max(0, player1.rankPoints + p1PointChange);
    const newPlayer2Points = Math.max(0, player2.rankPoints + p2PointChange);

    const p1Wins = winner === match.player1 ? player1.wins + 1 : player1.wins;
    const p1Losses = winner === match.player1 ? player1.losses : player1.losses + 1;
    const p2Wins = winner === match.player2 ? player2.wins + 1 : player2.wins;
    const p2Losses = winner === match.player2 ? player2.losses : player2.losses + 1;

    await updatePlayer(match.player1, { rankPoints: newPlayer1Points, wins: p1Wins, losses: p1Losses });
    await updatePlayer(match.player2, { rankPoints: newPlayer2Points, wins: p2Wins, losses: p2Losses });

    await saveMatch({
      player1: match.player1,
      player2: match.player2,
      player1Points: p1Score,
      player2Points: p2Score,
      winner,
      pointsChanged: pointChange,
    });

    Alert.alert('Success', `${winner} won the match!`);
    setPlayer1Score('');
    setPlayer2Score('');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Match</Text>
        {matches.map((match, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.matchButton, selectedMatch === index && styles.matchButtonActive]}
            onPress={() => setSelectedMatch(index)}
          >
            <Text style={[styles.matchButtonText, selectedMatch === index && styles.matchButtonTextActive]}>
              {match.label}
            </Text>
          </TouchableOpacity>
        ))}

        <Text style={styles.title}>Enter Scores</Text>
        <View style={styles.scoresContainer}>
          <View style={styles.scoreInput}>
            <Text style={styles.playerLabel}>{matches[selectedMatch].player1}</Text>
            <TextInput
              style={styles.input}
              placeholder="Score"
              keyboardType="numeric"
              value={player1Score}
              onChangeText={setPlayer1Score}
            />
          </View>
          <Text style={styles.vs}>vs</Text>
          <View style={styles.scoreInput}>
            <Text style={styles.playerLabel}>{matches[selectedMatch].player2}</Text>
            <TextInput
              style={styles.input}
              placeholder="Score"
              keyboardType="numeric"
              value={player2Score}
              onChangeText={setPlayer2Score}
            />
          </View>
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleRecordMatch}>
          <Text style={styles.submitButtonText}>Record Match</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 12, marginTop: 16, color: '#000' },
  matchButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  matchButtonActive: { borderColor: '#007AFF', backgroundColor: '#f0f8ff' },
  matchButtonText: { fontSize: 14, color: '#666', fontWeight: '600' },
  matchButtonTextActive: { color: '#007AFF' },
  scoresContainer: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24 },
  scoreInput: { alignItems: 'center', flex: 1 },
  playerLabel: { fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#000' },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    width: '90%',
    textAlign: 'center',
    fontSize: 16,
  },
  vs: { fontSize: 14, marginHorizontal: 8, fontWeight: 'bold', color: '#999' },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
});
