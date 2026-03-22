import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import HomeScreen from './src/screens/HomeScreen';
import AddGoalScreen from './src/screens/AddGoalScreen';
import GoalDetailScreen from './src/screens/GoalDetailScreen';
import SignInScreen from './src/screens/SignInScreen';

const Stack = createStackNavigator();

function MainStack() {
  const { user, signOut, isSupabaseConfigured } = useAuth();

  return (
    <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'AccountaBuddy',
          headerRight:
            isSupabaseConfigured && user
              ? () => (
                  <TouchableOpacity onPress={() => signOut()} style={{ marginRight: 16 }}>
                    <Text style={{ color: '#007bff', fontSize: 16 }}>Sign Out</Text>
                  </TouchableOpacity>
                )
              : undefined,
        }}
      />
      <Stack.Screen name="AddGoal" component={AddGoalScreen} options={{ title: 'Add Goal' }} />
      <Stack.Screen name="GoalDetail" component={GoalDetailScreen} options={{ title: 'Goal Details' }} />
    </Stack.Navigator>
  );
}

function RootNavigator() {
  const { user, skipSignIn, loading, isSupabaseConfigured } = useAuth();

  const showSignIn = !skipSignIn && (!isSupabaseConfigured || !user);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (showSignIn) {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="SignIn" component={SignInScreen} />
      </Stack.Navigator>
    );
  }

  return <MainStack />;
}

export default function App() {
  React.useEffect(() => {
    if (Platform.OS !== 'web') {
      const { requestPermissions } = require('./src/services/NotificationService');
      requestPermissions();
    }
  }, []);

  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
        <StatusBar style="auto" />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
