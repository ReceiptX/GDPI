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
import { calculatePricing, formatPricing, calculateSavings, PRICING_CONFIG } from '../utils/pricing';

interface HOARegistrationScreenProps {
  onRegistrationComplete: () => void;
}

export default function HOARegistrationScreen({ onRegistrationComplete }: HOARegistrationScreenProps) {
  const [hoaId, setHoaId] = useState('');
  const [hoaName, setHoaName] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [billingEmail, setBillingEmail] = useState('');
  const [homeownerCount, setHomeownerCount] = useState('');
  const [subscriptionTier, setSubscriptionTier] = useState<SubscriptionTier>('trial');
  const [registering, setRegistering] = useState(false);

  // Calculate pricing based on homeowner count
  const pricing = homeownerCount && parseInt(homeownerCount) > 0 
    ? calculatePricing(parseInt(homeownerCount))
    : null;
  
  const savings = homeownerCount && parseInt(homeownerCount) > 0
    ? calculateSavings(parseInt(homeownerCount))
    : null;

  const handleRegister = async () => {
    // Validation
    if (!hoaId.trim() || !hoaName.trim() || !adminName.trim() || !adminEmail.trim() || !homeownerCount.trim()) {
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

    // Validate homeowner count
    const count = parseInt(homeownerCount);
    if (isNaN(count) || count < 1) {
      Alert.alert('Error', 'Please enter a valid number of homeowners (minimum 1)');
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
        homeownerCount: count,
        trialDays: subscriptionTier === 'trial' ? 14 : undefined,
      };

      const result = await StorageService.registerHOA(registration);

      if (result.success) {
        const pricingInfo = calculatePricing(count);
        const pricingText = subscriptionTier === 'paid' 
          ? `\nMonthly cost: ${formatPricing(pricingInfo)}`
          : '';
        
        Alert.alert(
          'Registration Successful!',
          `HOA registered successfully!\n\n` +
          `HOA ID: ${hoaId}\n` +
          `Admin Email: ${adminEmail}\n` +
          `Admin PIN: ${result.adminPin}\n` +
          `Homeowners: ${count}${pricingText}\n\n` +
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

          <Text style={styles.label}>Number of Homeowners *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., 85"
            value={homeownerCount}
            onChangeText={setHomeownerCount}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>
            Total number of homeowners in your HOA
          </Text>

          {pricing && (
            <View style={styles.pricingPreview}>
              <Text style={styles.pricingTitle}>💰 Pricing Estimate</Text>
              <Text style={styles.pricingAmount}>
                ${pricing.pricePerHomeowner.toFixed(2)}/homeowner/month
              </Text>
              <Text style={styles.pricingTotal}>
                {pricing.homeownerCount} homeowners × ${pricing.pricePerHomeowner.toFixed(2)} = 
                <Text style={styles.pricingTotalBold}> ${pricing.monthlyTotal.toFixed(2)}/month</Text>
              </Text>
              {pricing.hasBulkDiscount && savings && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>
                    🎉 Bulk Discount Applied! Save ${savings.toFixed(2)}/month
                  </Text>
                </View>
              )}
              {!pricing.hasBulkDiscount && pricing.homeownerCount >= 25 && (
                <Text style={styles.discountHint}>
                  💡 Add {pricing.discountThreshold - pricing.homeownerCount} more homeowners to unlock bulk pricing 
                  (${PRICING_CONFIG.BULK_PRICE_PER_HOMEOWNER.toFixed(2)}/homeowner)
                </Text>
              )}
            </View>
          )}

          <Text style={styles.sectionTitle}>Subscription Plan</Text>

          <View style={styles.tierButtons}>
            <TouchableOpacity
              style={[styles.tierButton, subscriptionTier === 'trial' && styles.tierButtonSelected]}
              onPress={() => setSubscriptionTier('trial')}
            >
              <Text style={[styles.tierButtonText, subscriptionTier === 'trial' && styles.tierButtonTextSelected]}>
                14-Day Free Trial
              </Text>
              <Text style={styles.tierButtonSubtext}>No credit card required</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tierButton, subscriptionTier === 'paid' && styles.tierButtonSelected]}
              onPress={() => setSubscriptionTier('paid')}
            >
              <Text style={[styles.tierButtonText, subscriptionTier === 'paid' && styles.tierButtonTextSelected]}>
                Paid Subscription
              </Text>
              <Text style={styles.tierButtonSubtext}>
                {pricing ? `$${pricing.monthlyTotal.toFixed(2)}/month` : 'Enter homeowner count'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>What's Included:</Text>
            <Text style={styles.infoItem}>✓ AI-powered quote analysis for all homeowners</Text>
            <Text style={styles.infoItem}>✓ Arizona baseline pricing data</Text>
            <Text style={styles.infoItem}>✓ Unlimited quote analyses</Text>
            <Text style={styles.infoItem}>✓ Community pricing history</Text>
            <Text style={styles.infoItem}>✓ Admin management tools</Text>
            <Text style={styles.infoItem}>✓ PIN-based secure access</Text>
            <Text style={styles.infoItem}>✓ Red flag detection</Text>
          </View>

          <View style={styles.pricingInfoCard}>
            <Text style={styles.pricingInfoTitle}>📊 Per-Homeowner Pricing</Text>
            <Text style={styles.pricingInfoText}>
              • Standard: $3.00/homeowner/month
            </Text>
            <Text style={styles.pricingInfoText}>
              • Bulk (500+ homeowners): $1.50/homeowner/month
            </Text>
            <Text style={styles.pricingInfoNote}>
              The more homeowners in your HOA, the better the rate!
            </Text>
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
  pricingPreview: {
    backgroundColor: '#eff6ff',
    borderWidth: 2,
    borderColor: '#2563eb',
    borderRadius: 8,
    padding: 16,
    marginTop: 12,
    marginBottom: 16,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  pricingAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  pricingTotal: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
  },
  pricingTotalBold: {
    fontWeight: 'bold',
    color: '#1f2937',
    fontSize: 16,
  },
  discountBadge: {
    backgroundColor: '#10b981',
    borderRadius: 6,
    padding: 8,
    marginTop: 8,
  },
  discountText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
    textAlign: 'center',
  },
  discountHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
    fontStyle: 'italic',
  },
  pricingInfoCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  pricingInfoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 8,
  },
  pricingInfoText: {
    fontSize: 13,
    color: '#78350f',
    marginBottom: 4,
  },
  pricingInfoNote: {
    fontSize: 12,
    color: '#92400e',
    marginTop: 8,
    fontStyle: 'italic',
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
