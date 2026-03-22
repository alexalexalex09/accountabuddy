import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { addGoal as addGoalToStorage } from '../services/GoalsService';
import { createGoal, TIMESCALES } from '../models/goal';

const AddGoalScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [timescale, setTimescale] = useState('daily');

  const addGoal = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a goal name.');
      return;
    }

    const newGoal = createGoal({
      name: name.trim(),
      description: description.trim(),
      timescale,
    });

    try {
      await addGoalToStorage(newGoal, user?.id);

      if (Platform.OS !== 'web') {
        const { scheduleGoalNotifications } = require('../services/NotificationService');
        await scheduleGoalNotifications(newGoal);
      }
      navigation.goBack();
    } catch (error) {
      console.warn('Failed to add goal:', error);
      Alert.alert('Error', 'Unable to add goal. Please try again.');
    }
  };

  const timescaleLabels = {
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add New Goal</Text>
      <TextInput
        style={styles.input}
        placeholder="Goal (e.g. Log my calories)"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <Text style={styles.label}>Timescale</Text>
      <View style={styles.timescaleRow}>
        {TIMESCALES.map((ts) => (
          <TouchableOpacity
            key={ts}
            style={[styles.timescaleButton, timescale === ts && styles.timescaleButtonActive]}
            onPress={() => setTimescale(ts)}
          >
            <Text style={[styles.timescaleText, timescale === ts && styles.timescaleTextActive]}>
              {timescaleLabels[ts]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={addGoal}>
        <Text style={styles.buttonText}>Add Goal</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  timescaleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  timescaleButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ddd',
  },
  timescaleButtonActive: {
    borderColor: '#007bff',
    backgroundColor: '#e7f1ff',
  },
  timescaleText: {
    fontSize: 14,
    color: '#666',
  },
  timescaleTextActive: {
    color: '#007bff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default AddGoalScreen;
