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
import { HOARegistration, SubscriptionTier } from '../types';

interface HOARegistrationScreenProps {
  onRegistrationComplete: () => void;
}

export default function HOARegistrationScreen({ onRegistrationComplete }: HOARegistrationScreenProps) {
  const [hoaId, setHoaId] = useState('');
  const [hoaName, setHoaName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('trial');
  const [registering, setRegistering] = useState(false);

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
        billingEmail: billingEmail || adminEmail,
        subscriptionTier,
        trialDays: subscriptionTier === 'trial' ? 14 : undefined,
      };

      const result = await StorageService.registerHOA(registration);

      if (result.success) {
        Alert.alert(
          'Registration Successful!',
          `HOA registered successfully!\n\n` +
          `HOA ID: ${hoaId}\n` +
          `Admin Email: ${adminEmail}\n` +
          `Admin PIN: ${result.adminPin}\n\n` +
          `${subscriptionTier === 'trial' ? '14-day trial started. ' : ''}` +
          `Please save these credentials securely.`,
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
          Get started with GDPI to protect your community from overpriced garage door services
        </Text>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>HOA Information</Text>
          
          <Text style={styles.label}>HOA ID * (unique identifier)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., sunsetvillage"
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
            value={hoaName}
            onChangeText={setHoaName}
          />

          <Text style={styles.sectionTitle}>Administrator Details</Text>

          <Text style={styles.label}>Admin Name *</Text>
          <TextInput
            style={styles.input}
            placeholder="Full name"
            value={adminName}
            onChangeText={setAdminName}
          />

          <Text style={styles.label}>Admin Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="admin@yourhoa.com"
            value={adminEmail}
            onChangeText={setAdminEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.label}>Billing Email (optional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Same as admin email if left blank"
            value={billingEmail}
            onChangeText={setBillingEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.sectionTitle}>Subscription Plan</Text>

          <View style={styles.tierButtons}>
            <TouchableOpacity
              style={[styles.tierButton, subscriptionTier === 'trial' && styles.tierButtonSelected]}
              onPress={() => setSubscriptionTier('trial')}
            >
              <Text style={[styles.tierButtonText, subscriptionTier === 'trial' && styles.tierButtonTextSelected]}>
                14-Day Trial
              </Text>
              <Text style={styles.tierButtonSubtext}>Free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tierButton, subscriptionTier === 'basic' && styles.tierButtonSelected]}
              onPress={() => setSubscriptionTier('basic')}
            >
              <Text style={[styles.tierButtonText, subscriptionTier === 'basic' && styles.tierButtonTextSelected]}>
                Basic
              </Text>
              <Text style={styles.tierButtonSubtext}>$29/month</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tierButton, subscriptionTier === 'premium' && styles.tierButtonSelected]}
              onPress={() => setSubscriptionTier('premium')}
            >
              <Text style={[styles.tierButtonText, subscriptionTier === 'premium' && styles.tierButtonTextSelected]}>
                Premium
              </Text>
              <Text style={styles.tierButtonSubtext}>$79/month</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What's Included:</Text>
            <Text style={styles.infoItem}>✓ AI-powered quote analysis</Text>
            <Text style={styles.infoItem}>✓ Arizona baseline pricing data</Text>
            <Text style={styles.infoItem}>✓ Unlimited residents</Text>
            <Text style={styles.infoItem}>✓ Community pricing history</Text>
            <Text style={styles.infoItem}>✓ Admin management tools</Text>
            {subscriptionTier === 'premium' && (
              <>
                <Text style={styles.infoItem}>✓ Priority support</Text>
                <Text style={styles.infoItem}>✓ Advanced analytics</Text>
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.registerButton, registering && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={registering}
          >
            {registering ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.registerButtonText}>
                {subscriptionTier === 'trial' ? 'Start Free Trial' : 'Register & Pay'}
              </Text>
            )}
          </TouchableOpacity>

          <Text style={styles.footer}>
            {subscriptionTier === 'trial' 
              ? 'No credit card required for trial. Cancel anytime.' 
              : 'Payment processing will redirect to secure checkout.'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 24,
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginTop: 16,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  hint: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  tierButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  tierButton: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  tierButtonSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#eff6ff',
  },
  tierButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
  },
  tierButtonTextSelected: {
    color: '#2563eb',
  },
  tierButtonSubtext: {
    fontSize: 12,
    color: '#9ca3af',
  },
  infoCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  infoItem: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  registerButton: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonDisabled: {
    backgroundColor: '#93c5fd',
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
  },
});
