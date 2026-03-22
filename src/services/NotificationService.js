import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GOALS_STORAGE_KEY } from '../constants/storage';

// Configure notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const requestPermissions = async () => {
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
};

export const scheduleGoalNotifications = async (goal) => {
  const granted = await requestPermissions();
  if (!granted) {
    console.warn('Notifications permission not granted; skipping scheduling.');
    return;
  }

  await cancelGoalNotifications(goal.id);

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const reminderTimes = [
    { hour: 9, minute: 0, message: `Time to ${goal.name}!` },
    { hour: 12, minute: 0, message: `Don't forget to ${goal.name}!` },
    { hour: 15, minute: 0, message: `Reminder: ${goal.name}` },
    { hour: 18, minute: 0, message: `Last chance to ${goal.name} today!` },
  ];

  const aggressiveTimes = [];
  for (let hour = 20; hour <= 23; hour++) {
    aggressiveTimes.push({
      hour,
      minute: 0,
      message: `URGENT: You haven't ${goal.name} yet! Do it now!`,
    });
  }

  const allTimes = [...reminderTimes, ...aggressiveTimes];

  try {
    for (const time of allTimes) {
      const triggerTime = new Date(today);
      triggerTime.setHours(time.hour, time.minute, 0, 0);

      if (triggerTime > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Goal Reminder',
            body: time.message,
            data: { goalId: goal.id },
          },
          trigger: triggerTime,
        });
      }
    }

    const notificationIds = await Notifications.getAllScheduledNotificationsAsync();
    const goalNotificationIds = notificationIds
      .filter(n => n.content.data?.goalId === goal.id)
      .map(n => n.identifier);

    await AsyncStorage.setItem(`notifications_${goal.id}`, JSON.stringify(goalNotificationIds));
  } catch (error) {
    console.warn('Failed to schedule goal notifications:', error);
  }
};

export const scheduleHabitNotifications = async (habit) => {
  return scheduleGoalNotifications(habit);
};

export const cancelGoalNotifications = async (goalId) => {
  const storedIds = await AsyncStorage.getItem(`notifications_${goalId}`);
  if (storedIds) {
    const ids = JSON.parse(storedIds);
    for (const id of ids) {
      await Notifications.cancelScheduledNotificationAsync(id);
    }
    await AsyncStorage.removeItem(`notifications_${goalId}`);
  }
};

export const cancelHabitNotifications = cancelGoalNotifications;

export const checkAndUpdateNotifications = async () => {
  const stored = await AsyncStorage.getItem(GOALS_STORAGE_KEY);
  if (stored) {
    const goals = JSON.parse(stored);
    for (const goal of goals) {
      await scheduleGoalNotifications(goal);
    }
  }
};