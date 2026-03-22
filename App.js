import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import HomeScreen from './src/screens/HomeScreen';
import AddGoalScreen from './src/screens/AddGoalScreen';
import GoalDetailScreen from './src/screens/GoalDetailScreen';

const Stack = createStackNavigator();

export default function App() {
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const { requestPermissions } = require('./src/services/NotificationService');
      requestPermissions();
    }
  }, []);

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'AccountaBuddy' }} />
        <Stack.Screen name="AddGoal" component={AddGoalScreen} options={{ title: 'Add Goal' }} />
        <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal Details' }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}
