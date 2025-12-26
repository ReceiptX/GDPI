import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { StorageService } from '../services/storage';
import { HOARegistration } from '../types';
import { colors } from '../utils/theme';
import { EARLY_ACCESS_PLAN, formatCurrency, formatLockExpiration } from '../utils/subscription';
import { fonts } from '../utils/theme';

interface HOARegistrationScreenProps {
  onRegistrationComplete: () => void;
}

const planIntervalSuffix = (interval: 'monthly' | 'annual') => (interval === 'annual' ? 'yr' : 'mo');

export default function HOARegistrationScreen({ onRegistrationComplete }: HOARegistrationScreenProps) {
  const [hoaId, setHoaId] = useState('');
  const [hoaName, setHoaName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [registering, setRegistering] = useState(false);

  const planPrice = formatCurrency(EARLY_ACCESS_PLAN.price);
  const planInterval = planIntervalSuffix(EARLY_ACCESS_PLAN.billingInterval);
  const lockDurationYears = EARLY_ACCESS_PLAN.lockDurationYears;
  const includedItems = [
    'AI-powered quote analysis for all homeowners',
    'Arizona baseline pricing data',
    'Unlimited quote analyses',
    'Community pricing history',
    'Admin management tools',
    'PIN-based secure access',
    'Educational red-flag guidance',
    'Future GDPI services launched during your lock',
  ];

  const handleRegister = async () => {
    // Validation
    if (!hoaId.trim() || !hoaName.trim() || !adminName.trim() || !adminEmail.trim()) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    // Validate HOA ID format (alphanumeric, no spaces)
    if (!/^[a-z0-9]+$/i.test(hoaId)) {
      Alert.alert('Error', 'HOA ID must be alphanumeric with no spaces');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setRegistering(true);

    try {
      const registration: HOARegistration = {
        hoaId: hoaId.toLowerCase(),
        hoaName,
        adminEmail,
        adminName,
      };

      const result = await StorageService.registerHOA(registration);

      if (result.success) {
        const planLine = result.plan
          ? `Founding rate: ${formatCurrency(result.plan.lockedPrice)}/${planIntervalSuffix(result.plan.billingInterval)} locked until ${formatLockExpiration(result.plan.lockExpires)} (future services included).`
          : `Founding rate: ${formatCurrency(EARLY_ACCESS_PLAN.price)}/${planIntervalSuffix(EARLY_ACCESS_PLAN.billingInterval)} locked for ${EARLY_ACCESS_PLAN.lockDurationYears} years with future services included.`;

        Alert.alert(
          'Registration Successful!',
          `HOA registered successfully!\n\n` +
          `HOA ID: ${hoaId}\n` +
          `Admin Email: ${adminEmail}\n` +
          `Admin PIN: ${result.adminPin}\n\n` +
          `${planLine}\n\nPlease save these credentials securely.`,
          [
            {
              text: 'Continue to Login',
              onPress: onRegistrationComplete,
            },
          ]
        );
      } else {
        Alert.alert('Registration Failed', result.error || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An error occurred during registration');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Register Your HOA</Text>
        <Text style={styles.subtitle}>
          Get started with GDPI to protect your community from overpriced garage door services.
        </Text>

        <View style={styles.planCard}>
          <Text style={styles.planBadge}>Founding Price Lock</Text>
          <Text style={styles.planPrice}>
            {planPrice}
            <Text style={styles.planPriceInterval}>/{planInterval}</Text>
          </Text>
          <Text style={styles.planLock}>
            Locked for {lockDurationYears} years. Every GDPI feature today and in the future is included at this rate.
          </Text>
          <View style={styles.planPerkList}>
            {EARLY_ACCESS_PLAN.perks.map((perk) => (
              <Text key={perk} style={styles.planPerk}>• {perk}</Text>
            ))}
          </View>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>HOA Information</Text>

          <Text style={styles.label}>HOA ID * (unique identifier)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., sunsetvillage"
            placeholderTextColor={colors.textMuted}
            value={hoaId}
            onChangeText={setHoaId}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Text style={styles.hint}>Must be alphanumeric, no spaces</Text>

          <Text style={styles.label}>HOA Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Sunset Village HOA"
            placeholderTextColor={colors.textMuted}
            value={hoaName}
            onChangeText={setHoaName}
          />

          <Text style={styles.sectionTitle}>Administrator Details</Text>

          <Text style={styles.label}>Admin Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            placeholderTextColor={colors.textMuted}
            value={adminName}
            onChangeText={setAdminName}
          />

          <Text style={styles.label}>Admin Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@yourhoa.com"
            placeholderTextColor={colors.textMuted}
            value={adminEmail}
            onChangeText={setAdminEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>Included in your lock:</Text>
            {includedItems.map((item) => (
              <Text key={item} style={styles.infoItem}>✓ {item}</Text>
            ))}
          </View>

          <TouchableOpacity
            style={[styles.registerButton, registering && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>Register HOA</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            Founding rate locked at {planPrice}/{planInterval} for {lockDurationYears} years — every future GDPI service is included automatically.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontFamily: fonts.heading,
    color: colors.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textMuted,
    marginBottom: 24,
    lineHeight: 22,
  },
  form: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  planCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.accent,
    marginBottom: 24,
  },
  planBadge: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: colors.surfaceMuted,
    color: colors.accent,
    fontSize: 12,
    fontFamily: fonts.bodyStrong,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  planPrice: {
    fontSize: 36,
    fontFamily: fonts.heading,
    color: colors.text,
  },
  planPriceInterval: {
    fontSize: 16,
    color: colors.textMuted,
    fontFamily: fonts.body,
  },
  planLock: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 8,
    lineHeight: 20,
  },
  planPerkList: {
    marginTop: 12,
  },
  planPerk: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontFamily: fonts.bodyStrong,
    color: colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: colors.surfaceMuted,
    color: colors.text,
  },
  hint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  infoCard: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  infoTitle: {
    fontSize: 14,
    fontFamily: fonts.headingStrong,
    color: colors.text,
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: colors.accentAlt,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  registerButtonDisabled: {
    backgroundColor: 'rgba(59, 130, 246, 0.35)',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: fonts.bodyStrong,
  },
  footer: {
    fontSize: 12,
    fontFamily: fonts.body,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 12,
  },
});
