import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyzeResponse } from '../services/AIService';
import { GOALS_STORAGE_KEY } from '../constants/storage';
import { TIMESCALES } from '../models/goal';

const GoalDetailScreen = ({ route, navigation }) => {
  const { goal: initialGoal } = route.params;
  const [goal, setGoal] = useState(initialGoal);
  const [response, setResponse] = useState('');
  const [responses, setResponses] = useState(initialGoal.responses || []);
  const [isCompletedToday, setIsCompletedToday] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(initialGoal.name);
  const [editDescription, setEditDescription] = useState(initialGoal.description || '');
  const [editTimescale, setEditTimescale] = useState(initialGoal.timescale || 'daily');

  useEffect(() => {
    checkTodayCompletion();
  }, []);

  const checkTodayCompletion = () => {
    const today = new Date().toDateString();
    const todayResponse = responses.find(r => new Date(r.date).toDateString() === today);
    setIsCompletedToday(!!todayResponse && todayResponse.completed);
  };

  const saveGoalEdit = async () => {
    const updated = {
      ...goal,
      name: editName.trim(),
      description: editDescription.trim(),
      timescale: editTimescale,
    };
    if (!updated.name) {
      Alert.alert('Error', 'Goal name cannot be empty.');
      return;
    }
    try {
      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      const goals = JSON.parse(stored || '[]');
      const idx = goals.findIndex(g => g.id === goal.id);
      if (idx >= 0) {
        goals[idx] = { ...goals[idx], ...updated };
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        setGoal(updated);
        setIsEditing(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes.');
    }
  };

  const submitResponse = async () => {
    if (!response.trim()) {
      Alert.alert('Error', 'Please enter a response.');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const existingIndex = responses.findIndex(r => r.date === today);

    try {
      const analysis = await analyzeResponse(response);
      const newResponse = {
        date: today,
        text: response,
        completed: analysis.completed,
        sentiment: analysis.sentiment,
      };

      let updatedResponses;
      if (existingIndex >= 0) {
        updatedResponses = [...responses];
        updatedResponses[existingIndex] = newResponse;
      } else {
        updatedResponses = [...responses, newResponse];
      }

      setResponses(updatedResponses);
      setResponse('');
      setIsCompletedToday(newResponse.completed);

      const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
      const goals = JSON.parse(stored || '[]');
      const idx = goals.findIndex(g => g.id === goal.id);
      if (idx >= 0) {
        goals[idx].responses = updatedResponses;
        await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      }

      Alert.alert('Success', `Response submitted. Completed: ${newResponse.completed ? 'Yes' : 'No'}`);
    } catch (error) {
      Alert.alert('Error', 'Failed to analyze response. Please try again.');
    }
  };

  const renderResponse = ({ item }) => (
    <View style={styles.responseItem}>
      <Text style={styles.responseDate}>{new Date(item.date).toLocaleDateString()}</Text>
      <Text>{item.text}</Text>
      <Text style={item.completed ? styles.completed : styles.notCompleted}>
        Completed: {item.completed ? 'Yes' : 'No'}
      </Text>
      <Text>Sentiment: {item.sentiment}</Text>
    </View>
  );

  const timescaleLabels = { daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly' };

  return (
    <View style={styles.container}>
      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            style={styles.input}
            placeholder="Goal name"
            value={editName}
            onChangeText={setEditName}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Description (optional)"
            value={editDescription}
            onChangeText={setEditDescription}
            multiline
          />
          <Text style={styles.label}>Timescale</Text>
          <View style={styles.timescaleRow}>
            {TIMESCALES.map((ts) => (
              <TouchableOpacity
                key={ts}
                style={[styles.timescaleButton, editTimescale === ts && styles.timescaleButtonActive]}
                onPress={() => setEditTimescale(ts)}
              >
                <Text style={[styles.timescaleText, editTimescale === ts && styles.timescaleTextActive]}>
                  {timescaleLabels[ts]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.button} onPress={saveGoalEdit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setIsEditing(false)}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.headerRow}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{goal.name}</Text>
              {goal.description ? (
                <Text style={styles.description}>{goal.description}</Text>
              ) : null}
              {goal.timescale ? (
                <Text style={styles.timescaleTag}>{timescaleLabels[goal.timescale] || goal.timescale}</Text>
              ) : null}
            </View>
            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>

          {!isCompletedToday && (
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="How did your goal go today?"
                value={response}
                onChangeText={setResponse}
                multiline
              />
              <TouchableOpacity style={styles.button} onPress={submitResponse}>
                <Text style={styles.buttonText}>Submit Response</Text>
              </TouchableOpacity>
            </View>
          )}

          {isCompletedToday && (
            <Text style={styles.completedMessage}>Goal completed for today!</Text>
          )}

          <Text style={styles.historyTitle}>Response History</Text>
          <FlatList
            data={responses.sort((a, b) => new Date(b.date) - new Date(a.date))}
            renderItem={renderResponse}
            keyExtractor={(item) => item.date}
            style={styles.historyList}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    marginBottom: 6,
    color: '#666',
  },
  timescaleTag: {
    fontSize: 14,
    color: '#888',
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  editContainer: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  timescaleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  timescaleButton: {
    flex: 1,
    padding: 10,
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
    fontSize: 12,
    color: '#666',
  },
  timescaleTextActive: {
    color: '#007bff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
  },
  cancelButton: {
    padding: 15,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
  completedMessage: {
    fontSize: 18,
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 20,
  },
  historyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  historyList: {
    flex: 1,
  },
  responseItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  responseDate: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  completed: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  notCompleted: {
    color: '#dc3545',
    fontWeight: 'bold',
  },
});

export default GoalDetailScreen;
