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
  ActivityIndicator,
} from 'react-native';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';
import { colors, spacing, radius, fonts } from '../utils/theme';

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
      await telemetry.traceOperation('user.login', { hoaId, email }, async () => {
        const user = await StorageService.authenticateUser(hoaId.trim().toLowerCase(), email.trim().toLowerCase(), pin.trim());

        if (user) {
          await StorageService.setCurrentUser(user);
          onLogin(user);
          return;
        }

        Alert.alert(
          'Login Failed',
          'Invalid credentials. Please check your HOA ID, email, and PIN.\n\nDemo credentials:\nHOA: hoa001\nEmail: admin@hoa001.com or resident@hoa001.com\nPIN: 1234 or 5678'
        );
      });
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'An error occurred during login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.content}>
        <Text style={styles.title}>GDPI</Text>
        <Text style={styles.subtitle}>Garage Door Pricing Index</Text>
        <Text style={styles.description}>Protect your community from overpriced garage door quotes.</Text>

        <View style={styles.form}>
          <Text style={styles.label}>HOA ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., hoa001"
            placeholderTextColor={colors.textMuted}
            value={hoaId}
            onChangeText={setHoaId}
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="your@email.com"
            placeholderTextColor={colors.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.label}>PIN</Text>
          <TextInput
            style={styles.input}
            placeholder="4-digit PIN"
            placeholderTextColor={colors.textMuted}
            value={pin}
            onChangeText={setPin}
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color={colors.text} /> : <Text style={styles.buttonText}>Sign in</Text>}
          </TouchableOpacity>
        </View>

        {onRegister && (
          <TouchableOpacity style={styles.registerLink} onPress={onRegister} disabled={loading}>
            <Text style={styles.registerLinkText}>Don't have an account? Register your HOA</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.footer}>Arizona HOAs only • Minimal data • PIN-based access</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  title: {
    fontSize: 38,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    fontFamily: fonts.bodyStrong,
    color: colors.accent,
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  description: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: fonts.body,
    color: colors.textMuted,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  label: {
    marginTop: spacing.md,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: fonts.bodyStrong,
    color: colors.text,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    fontSize: 16,
    fontFamily: fonts.body,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
  },
  button: {
    marginTop: spacing.lg,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.accentAlt,
    borderWidth: 1,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  buttonText: {
    color: colors.text,
    fontSize: 14,
    fontFamily: fonts.bodyBold,
  },
  registerLink: {
    marginTop: spacing.md,
    padding: 10,
    alignItems: 'center',
  },
  registerLinkText: {
    fontSize: 14,
    fontFamily: fonts.bodyStrong,
    color: colors.accent,
  },
  footer: {
    marginTop: spacing.md,
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
