import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User } from '../types';
import { StorageService } from '../services/storage';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
  user: User;
  onLogout: () => void;
}

export default function HomeScreen({ navigation, user, onLogout }: HomeScreenProps) {
  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await StorageService.clearCurrentUser();
          onLogout();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Welcome, {user.email}</Text>
          <Text style={styles.roleText}>
            {user.role === 'admin' ? 'HOA Administrator' : 'Resident'}
          </Text>
          <Text style={styles.hoaText}>HOA: {user.hoaId}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analyze a Quote</Text>
          
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => navigation.navigate('AIQuoteAnalysis')}
          >
            <Text style={styles.primaryButtonText}>📄 AI Analyze My Quote</Text>
            <Text style={styles.buttonSubtext}>
              Upload or paste written quote for instant AI analysis
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('ManualQuoteEntry')}
          >
            <Text style={styles.secondaryButtonText}>✍️ Manual Entry</Text>
            <Text style={styles.buttonSubtext}>
              No written quote? Enter parts & labor manually
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Community Data</Text>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate('NeighborhoodPricing')}
          >
            <Text style={styles.secondaryButtonText}>📊 Neighborhood Pricing</Text>
            <Text style={styles.buttonSubtext}>
              See anonymized pricing history from your HOA
            </Text>
          </TouchableOpacity>

          {user.role === 'admin' && (
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => navigation.navigate('AdminRoster')}
            >
              <Text style={styles.adminButtonText}>👥 Manage Residents</Text>
              <Text style={styles.buttonSubtext}>
                Add/remove residents, rotate PINs
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.educationCard}>
          <Text style={styles.educationTitle}>⚠️ Arizona Baseline Pricing</Text>
          <View style={styles.pricingList}>
            <Text style={styles.pricingItem}>• Service Call: $75-$150</Text>
            <Text style={styles.pricingItem}>• Torsion Springs (pair): $320-$520</Text>
            <Text style={styles.pricingItem}>• Rollers + Tune-up: $180-$320</Text>
            <Text style={styles.pricingItem}>• Opener Replacement: $650-$900</Text>
            <Text style={styles.pricingItem}>• Double Door: $2,400-$3,600</Text>
          </View>
          <Text style={styles.educationFooter}>
            🚨 After-hours typically 1.4-2.0× scheduled rates
          </Text>
        </View>

        <View style={styles.warningCard}>
          <Text style={styles.warningTitle}>Common Hustler Tactics</Text>
          <Text style={styles.warningItem}>• Vague "lifetime" warranty kits</Text>
          <Text style={styles.warningItem}>• Duplicate line item charges</Text>
          <Text style={styles.warningItem}>• Unnecessary full door replacement</Text>
          <Text style={styles.warningItem}>• Extreme labor markups</Text>
          <Text style={styles.warningItem}>• Refurbished parts sold as new</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
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
  header: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  roleText: {
    fontSize: 14,
    color: '#2563eb',
    marginBottom: 2,
  },
  hoaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  adminButton: {
    backgroundColor: '#10b981',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  adminButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  educationCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  educationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  pricingList: {
    marginBottom: 12,
  },
  pricingItem: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 4,
  },
  educationFooter: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
  },
  warningCard: {
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#f87171',
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 12,
  },
  warningItem: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 4,
  },
  logoutButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  logoutButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
});
