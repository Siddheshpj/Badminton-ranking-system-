import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView } from 'react-native';
import { recordMatchResult } from '../utils/dataManager';

const DAILY_MATCHES = [
  { label: 'Piyush vs Siddhesh', player1: 'Piyush', player2: 'Siddhesh' },
  { label: 'Sanskar vs Piyush', player1: 'Sanskar', player2: 'Piyush' },
  { label: 'Sanskar vs Siddhesh', player1: 'Sanskar', player2: 'Siddhesh' },
];

export default function RecordMatchScreen() {
  const [selectedMatch, setSelectedMatch] = useState(0);
  const [player1Score, setPlayer1Score] = useState('');
  const [player2Score, setPlayer2Score] = useState('');

  const handleRecordMatch = async () => {
    if (!player1Score || !player2Score) {
      Alert.alert('Error', 'Please enter scores for both players');
      return;
    }

    const match = DAILY_MATCHES[selectedMatch];

    try {
      const result = await recordMatchResult({
        player1: match.player1,
        player2: match.player2,
        player1Score,
        player2Score,
      });

      const winnerBonus = result.match?.streakBonusByPlayer?.[result.winner] || 0;

      Alert.alert(
        'Match Recorded',
        `${result.winner} won by ${result.margin} point(s).\nBase points: ±${result.pointsChanged}${
          winnerBonus ? `\nStreak bonus: ${winnerBonus > 0 ? '+' : ''}${winnerBonus}` : ''
        }`
      );

      setPlayer1Score('');
      setPlayer2Score('');
    } catch (error) {
      Alert.alert('Error', error.message || 'Unable to record match');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Select Match</Text>
        {DAILY_MATCHES.map((match, index) => (
          <TouchableOpacity
            key={match.label}
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
            <Text style={styles.playerLabel}>{DAILY_MATCHES[selectedMatch].player1}</Text>
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
            <Text style={styles.playerLabel}>{DAILY_MATCHES[selectedMatch].player2}</Text>
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
    backgroundColor: 'white',
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
