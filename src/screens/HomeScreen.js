import React, { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { getGoals } from '../services/GoalsService';

const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);

  const loadGoals = async () => {
    try {
      const data = await getGoals(user?.id);
      setGoals(data || []);
    } catch (error) {
      console.warn('Failed to load goals:', error);
      setGoals([]);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [user?.id])
  );

  const renderGoal = ({ item }) => (
    <TouchableOpacity
      style={styles.goalItem}
      onPress={() => navigation.navigate('GoalDetail', { goal: item })}
    >
      <Text style={styles.goalText}>{item.name}</Text>
    </TouchableOpacity>
  );

  if (goals.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>My Goals</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>You don't have any goals yet.</Text>
          <Text style={styles.emptySubtext}>Create your first goal to get started!</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => navigation.navigate('AddGoal')}
          >
            <Text style={styles.addButtonText}>Create your first goal</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Goals</Text>
      <FlatList
        data={goals}
        renderItem={renderGoal}
        keyExtractor={(item) => item.id}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('AddGoal')}
      >
        <Text style={styles.addButtonText}>Add Goal</Text>
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
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  goalItem: {
    backgroundColor: '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  goalText: {
    fontSize: 18,
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
