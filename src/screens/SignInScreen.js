import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';

function useWebBrowser() {
  const [webBrowser, setWebBrowser] = useState(null);

  useEffect(() => {
    try {
      const WB = require('expo-web-browser');
      WB.maybeCompleteAuthSession();
      setWebBrowser(WB);
    } catch (e) {
      setWebBrowser(null);
    }
  }, []);

  return webBrowser;
}

const SignInScreen = () => {
  const {
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    skipAuth,
    isSupabaseConfigured,
  } = useAuth();
  const webBrowser = useWebBrowser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password.');
      return;
    }
    setLoading(true);
    try {
      if (isSignUp) {
        await signUpWithEmail(email.trim(), password);
        Alert.alert('Success', 'Check your email to confirm your account.');
      } else {
        await signInWithEmail(email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    const WB = webBrowser;
    if (!WB) {
      Alert.alert(
        'Rebuild required',
        'Google sign-in needs a fresh build. Run: npx expo run:android'
      );
      return;
    }
    setLoading(true);
    try {
      const AuthSession = require('expo-auth-session');
      const redirectUri = AuthSession.makeRedirectUri({ path: '/' });
      const { data, error } = await signInWithGoogle({ redirectTo: redirectUri });
      if (error) throw error;
      if (data?.url) {
        const result = await WB.openAuthSessionAsync(data.url, redirectUri);
        if (result.type === 'success' && result.url) {
          const url = result.url;
          const fragment = url.split('#')[1];
          if (fragment) {
            const params = new URLSearchParams(fragment);
            const accessToken = params.get('access_token');
            const refreshToken = params.get('refresh_token');
            if (accessToken && refreshToken) {
              const { supabase } = require('../lib/supabase');
              await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
              return;
            }
          }
        }
      }
      Alert.alert('Error', 'Google sign-in was cancelled or failed.');
    } catch (error) {
      Alert.alert('Error', error.message || 'Google sign-in failed.');
    } finally {
      setLoading(false);
    }
  };

  if (!isSupabaseConfigured) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>AccountaBuddy</Text>
        <Text style={styles.subtitle}>
          Auth is not configured. Add EXPO_PUBLIC_SUPABASE_URL and
          EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY to your .env to enable sign-in.
        </Text>
        <TouchableOpacity style={styles.primaryButton} onPress={skipAuth}>
          <Text style={styles.primaryButtonText}>Continue without signing in</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>AccountaBuddy</Text>
      <Text style={styles.subtitle}>Sign in to sync your goals across devices</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete={isSignUp ? 'password-new' : 'password'}
      />

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleEmailAuth}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => setIsSignUp(!isSignUp)}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>
          {isSignUp ? 'Already have an account? Sign in' : 'Create an account'}
        </Text>
      </TouchableOpacity>

      {webBrowser && (
        <>
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogleSignIn}
            disabled={loading}
          >
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.skipButton}
        onPress={skipAuth}
        disabled={loading}
      >
        <Text style={styles.skipButtonText}>Continue without account</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#888',
    marginTop: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButton: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    padding: 16,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#ddd',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#888',
    fontSize: 14,
  },
  googleButton: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  googleButtonText: {
    color: '#333',
    fontSize: 16,
  },
  skipButton: {
    marginTop: 24,
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#888',
    fontSize: 14,
  },
});

export default SignInScreen;
