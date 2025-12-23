import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';

interface LoginScreenProps {
  onLogin: (user: any) => void;
  onRegister?: () => void;
}

export default function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [hoaId, setHoaId] = useState('');
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!hoaId.trim() || !email.trim() || !pin.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      await telemetry.traceOperation(
        'user.login',
        { hoaId, email },
        async () => {
          const user = await StorageService.authenticateUser(hoaId, email, pin);

          if (user) {
            // Check subscription status
            const subscription = await StorageService.checkSubscription(hoaId);
            
            if (!subscription.active) {
              Alert.alert(
                'Subscription Required',
                subscription.tier === 'trial_expired' 
                  ? 'Your trial has expired. Please upgrade to continue using GDPI.'
                  : 'This HOA does not have an active subscription. Please contact your administrator.',
                [{ text: 'OK' }]
              );
              setLoading(false);
              return;
            }

            // Show trial warning if less than 3 days remaining
            if (subscription.tier === 'trial' && subscription.daysRemaining && subscription.daysRemaining <= 3) {
              Alert.alert(
                'Trial Ending Soon',
                `Your trial expires in ${subscription.daysRemaining} days. Upgrade to continue using GDPI.`,
                [{ text: 'OK', onPress: () => {
                  StorageService.setCurrentUser(user);
                  onLogin(user);
                }}]
              );
            } else {
              await StorageService.setCurrentUser(user);
              onLogin(user);
            }
          } else {
            Alert.alert(
              'Login Failed',
              'Invalid credentials. Please check your HOA ID, email, and PIN.\n\nDemo credentials:\nHOA: hoa001\nEmail: admin@hoa001.com or resident@hoa001.com\nPIN: 1234 or 5678'
            );
          }
        }
      );
    } catch (error) {
      Alert.alert('Error', 'An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.title}>GDPI</Text>
        <Text style={styles.subtitle}>Garage Door Pricing Index</Text>
        <Text style={styles.description}>
          Protect your community from overpriced garage door quotes
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>HOA ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., hoa001"
            value={hoaId}
            onChangeText={setHoaId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your 4-digit PIN"
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.footer}>
          Arizona HOAs only • No PII collected • Licensed vendors recommended
        </Text>

        {onRegister && (
          <TouchableOpacity style={styles.registerLink} onPress={onRegister}>
            <Text style={styles.registerLinkText}>
              Don't have an account? Register your HOA
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#93c5fd',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 24,
  },
  registerLink: {
    marginTop: 16,
    padding: 12,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    color: '#2563eb',
    fontWeight: '600',
  },
});
