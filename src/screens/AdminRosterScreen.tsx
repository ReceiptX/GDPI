import React, { useState, useEffect } from 'react';
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
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { User, Resident } from '../types';
import { StorageService } from '../services/storage';
import { telemetry } from '../services/telemetry';

type AdminRosterScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'AdminRoster'
>;

interface AdminRosterScreenProps {
  navigation: AdminRosterScreenNavigationProp;
  user: User;
}

export default function AdminRosterScreen({
  navigation,
  user,
}: AdminRosterScreenProps) {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmail, setNewEmail] = useState('');
  const [newPin, setNewPin] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    setLoading(true);
    try {
      await telemetry.traceOperation(
        'storage.load_residents',
        { hoaId: user.hoaId },
        async () => {
          const hoaResidents = await StorageService.getResidentsByHoaId(user.hoaId);
          setResidents(hoaResidents);
        }
      );
    } catch (error) {
      console.error('Error loading residents:', error);
      Alert.alert('Error', 'Failed to load residents');
    } finally {
      setLoading(false);
    }
  };

  const generatePin = async (): Promise<string> => {
    // Production-ready cryptographically secure PIN generation
    return await StorageService.generateSecurePin();
  };

  const handleAddResident = async () => {
    if (!newEmail.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }

    setAdding(true);
    try {
      const pin = newPin.trim() || await generatePin();
      
      if (pin.length !== 4 || !/^\d+$/.test(pin)) {
        Alert.alert('Error', 'PIN must be exactly 4 digits');
        setAdding(false);
        return;
      }

      // Check if email already exists
      if (residents.some(r => r.email === newEmail.trim())) {
        Alert.alert('Error', 'This email is already registered');
        setAdding(false);
        return;
      }

      const newResident: Resident = {
        email: newEmail.trim(),
        pin,
        hoaId: user.hoaId,
        role: 'homeowner', // Default role for new residents
        createdAt: new Date().toISOString(),
      };

      await StorageService.addResident(newResident);
      await loadResidents();
      setNewEmail('');
      setNewPin('');
      
      Alert.alert(
        'Success',
        `Resident added!\n\nEmail: ${newResident.email}\nPIN: ${newResident.pin}\n\nPlease share these credentials with the resident.`
      );
    } catch (error) {
      console.error('Error adding resident:', error);
      Alert.alert('Error', 'Failed to add resident');
    } finally {
      setAdding(false);
    }
  };

  const handleRotatePin = async (resident: Resident) => {
    Alert.alert(
      'Rotate PIN',
      `Generate a new PIN for ${resident.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Generate',
          onPress: async () => {
            const newPin = await generatePin();
            try {
              await StorageService.updateResident(resident.email, { pin: newPin });
              await loadResidents();
              Alert.alert(
                'PIN Rotated',
                `New PIN for ${resident.email}: ${newPin}\n\nPlease share this with the resident.`
              );
            } catch (error) {
              console.error('Error rotating PIN:', error);
              Alert.alert('Error', 'Failed to rotate PIN');
            }
          },
        },
      ]
    );
  };

  const handleUpdateEmail = async (resident: Resident) => {
    Alert.prompt(
      'Update Email',
      `Current: ${resident.email}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Update',
          onPress: async (newEmail?: string) => {
            if (!newEmail || !newEmail.trim()) {
              Alert.alert('Error', 'Email cannot be empty');
              return;
            }

            try {
              await StorageService.updateResident(resident.email, { email: newEmail.trim() });
              await loadResidents();
              Alert.alert('Success', 'Email updated successfully');
            } catch (error) {
              console.error('Error updating email:', error);
              Alert.alert('Error', 'Failed to update email');
            }
          },
        },
      ],
      'plain-text',
      resident.email
    );
  };

  const handleRemoveResident = async (resident: Resident) => {
    Alert.alert(
      'Remove Resident',
      `Are you sure you want to remove ${resident.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await StorageService.removeResident(resident.email, user.hoaId);
              await loadResidents();
              Alert.alert('Success', 'Resident removed');
            } catch (error) {
              console.error('Error removing resident:', error);
              Alert.alert('Error', 'Failed to remove resident');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563eb" />
        <Text style={styles.loadingText}>Loading residents...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerText}>
          Manage residents for HOA: {user.hoaId}
        </Text>

        <View style={styles.addSection}>
          <Text style={styles.sectionTitle}>Add New Resident</Text>
          
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="resident@email.com"
            value={newEmail}
            onChangeText={setNewEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoCorrect={false}
          />

          <Text style={styles.label}>PIN (leave empty to auto-generate)</Text>
          <TextInput
            style={styles.input}
            placeholder="4-digit PIN"
            value={newPin}
            onChangeText={setNewPin}
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity
            style={[styles.addButton, adding && styles.addButtonDisabled]}
            onPress={handleAddResident}
            disabled={adding}
          >
            {adding ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.addButtonText}>Add Resident</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.rosterSection}>
          <Text style={styles.sectionTitle}>Current Residents ({residents.length})</Text>
          
          {residents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No residents yet</Text>
            </View>
          ) : (
            residents.map((resident) => (
              <View key={resident.email} style={styles.residentCard}>
                <View style={styles.residentInfo}>
                  <Text style={styles.residentEmail}>{resident.email}</Text>
                  <Text style={styles.residentPin}>PIN: {resident.pin}</Text>
                </View>
                <View style={styles.residentActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleRotatePin(resident)}
                  >
                    <Text style={styles.actionButtonText}>🔄 Rotate PIN</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleUpdateEmail(resident)}
                  >
                    <Text style={styles.actionButtonText}>✏️ Edit Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.removeButton]}
                    onPress={() => handleRemoveResident(resident)}
                  >
                    <Text style={[styles.actionButtonText, styles.removeButtonText]}>
                      🗑️ Remove
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>💡 Admin Tips</Text>
          <Text style={styles.infoItem}>
            • Rotate PINs regularly for security
          </Text>
          <Text style={styles.infoItem}>
            • Share credentials securely with residents
          </Text>
          <Text style={styles.infoItem}>
            • No PII is stored in quote history (fully anonymized)
          </Text>
          <Text style={styles.infoItem}>
            • All quote data is scoped to your HOA only
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  headerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 24,
  },
  addSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
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
    marginBottom: 16,
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
  addButton: {
    backgroundColor: '#10b981',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 16,
  },
  addButtonDisabled: {
    backgroundColor: '#6ee7b7',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  rosterSection: {
    marginBottom: 24,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9ca3af',
  },
  residentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  residentInfo: {
    marginBottom: 12,
  },
  residentEmail: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  residentPin: {
    fontSize: 14,
    color: '#6b7280',
    fontFamily: 'monospace',
  },
  residentActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    backgroundColor: '#eff6ff',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#bfdbfe',
  },
  actionButtonText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  removeButton: {
    backgroundColor: '#fee2e2',
    borderColor: '#fecaca',
  },
  removeButtonText: {
    color: '#991b1b',
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 12,
  },
  infoItem: {
    fontSize: 14,
    color: '#78350f',
    marginBottom: 6,
    lineHeight: 20,
  },
});
