import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { GOALS_STORAGE_KEY, LEGACY_HABITS_STORAGE_KEY } from '../constants/storage';
import { habitToGoal } from '../models/goal';

const toDbGoal = (goal, userId) => ({
  id: goal.id,
  user_id: userId,
  name: goal.name,
  description: goal.description || '',
  timescale: goal.timescale || 'daily',
  reminder_policy: goal.reminderPolicy || 'default',
  created_at: goal.createdAt,
  responses: goal.responses || [],
});

const fromDbGoal = (row) => ({
  id: row.id,
  name: row.name,
  description: row.description || '',
  timescale: row.timescale || 'daily',
  reminderPolicy: row.reminder_policy || 'default',
  createdAt: row.created_at,
  responses: row.responses || [],
});

export const getGoals = async (userId) => {
  if (isSupabaseConfigured() && userId) {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map(fromDbGoal);
  }

  let stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
  if (!stored) {
    const legacy = await AsyncStorage.getItem(LEGACY_HABITS_STORAGE_KEY);
    if (legacy) {
      const habits = JSON.parse(legacy);
      const migrated = habits.map(habitToGoal);
      await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(migrated));
      await AsyncStorage.removeItem(LEGACY_HABITS_STORAGE_KEY);
      stored = JSON.stringify(migrated);
    }
  }
  return stored ? JSON.parse(stored) : [];
};

export const addGoal = async (goal, userId) => {
  if (isSupabaseConfigured() && userId) {
    const dbGoal = toDbGoal(goal, userId);
    const { error } = await supabase.from('goals').insert(dbGoal);
    if (error) throw error;
    return goal;
  }

  const goals = await getGoals(userId);
  goals.push(goal);
  await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  return goal;
};

export const updateGoal = async (goal, userId) => {
  if (isSupabaseConfigured() && userId) {
    const { error } = await supabase
      .from('goals')
      .update({
        name: goal.name,
        description: goal.description || '',
        timescale: goal.timescale || 'daily',
        reminder_policy: goal.reminderPolicy || 'default',
        responses: goal.responses || [],
      })
      .eq('id', goal.id)
      .eq('user_id', userId);
    if (error) throw error;
    return goal;
  }

  const goals = await getGoals(userId);
  const idx = goals.findIndex((g) => g.id === goal.id);
  if (idx >= 0) {
    goals[idx] = goal;
    await AsyncStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
  }
  return goal;
};

export const syncLocalToCloud = async (userId) => {
  if (!isSupabaseConfigured() || !userId) return;

  const local = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
  if (!local) return;

  const goals = JSON.parse(local);
  for (const goal of goals) {
    const dbGoal = toDbGoal(goal, userId);
    await supabase.from('goals').upsert(dbGoal, { onConflict: 'id' });
  }
};
