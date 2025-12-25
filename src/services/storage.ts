import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, User, Quote, Resident, HOARegistration, SubscriptionRecord } from '../types';
import { buildSubscriptionRecord } from '../utils/subscription';

const STORAGE_KEY = 'gdpi_app_data';
const USER_KEY = 'gdpi_current_user';

// Initialize default app data
const defaultAppData: AppData = {
  hoaId: '',
  residents: [],
  quoteHistory: [],
  subscriptions: [],
};

export const StorageService = {
  // User authentication
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async setCurrentUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting current user:', error);
      throw error;
    }
  },

  async clearCurrentUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(USER_KEY);
    } catch (error) {
      console.error('Error clearing current user:', error);
      throw error;
    }
  },

  // App data management
  async getAppData(): Promise<AppData> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        return { ...defaultAppData };
      }
      const parsed = JSON.parse(data);
      return {
        ...defaultAppData,
        ...parsed,
        residents: parsed?.residents ?? [],
        quoteHistory: parsed?.quoteHistory ?? [],
        subscriptions: parsed?.subscriptions ?? [],
      };
    } catch (error) {
      console.error('Error getting app data:', error);
      return defaultAppData;
    }
  },

  async setAppData(data: AppData): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error setting app data:', error);
      throw error;
    }
  },

  // Quote history management (scoped by hoaId)
  async addQuote(quote: Quote): Promise<void> {
    try {
      const appData = await this.getAppData();
      appData.quoteHistory.push(quote);
      await this.setAppData(appData);
    } catch (error) {
      console.error('Error adding quote:', error);
      throw error;
    }
  },

  async getQuotesByHoaId(hoaId: string): Promise<Quote[]> {
    try {
      const appData = await this.getAppData();
      return appData.quoteHistory.filter(q => q.hoaId === hoaId);
    } catch (error) {
      console.error('Error getting quotes:', error);
      return [];
    }
  },

  // Resident management (admin only)
  async getResidentsByHoaId(hoaId: string): Promise<Resident[]> {
    try {
      const appData = await this.getAppData();
      return appData.residents.filter(r => r.hoaId === hoaId);
    } catch (error) {
      console.error('Error getting residents:', error);
      return [];
    }
  },

  async addResident(resident: Resident): Promise<void> {
    try {
      const appData = await this.getAppData();
      appData.residents.push(resident);
      await this.setAppData(appData);
    } catch (error) {
      console.error('Error adding resident:', error);
      throw error;
    }
  },

  async updateResident(email: string, updates: Partial<Resident>): Promise<void> {
    try {
      const appData = await this.getAppData();
      const index = appData.residents.findIndex(r => r.email === email);
      if (index !== -1) {
        // Use immutable update pattern
        appData.residents = [
          ...appData.residents.slice(0, index),
          { ...appData.residents[index], ...updates },
          ...appData.residents.slice(index + 1)
        ];
        await this.setAppData(appData);
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      throw error;
    }
  },

  async removeResident(email: string, hoaId: string): Promise<void> {
    try {
      const appData = await this.getAppData();
      appData.residents = appData.residents.filter(
        r => !(r.email === email && r.hoaId === hoaId)
      );
      await this.setAppData(appData);
    } catch (error) {
      console.error('Error removing resident:', error);
      throw error;
    }
  },

  async getSubscriptionByHoaId(hoaId: string): Promise<SubscriptionRecord | null> {
    try {
      const appData = await this.getAppData();
      return appData.subscriptions.find((record) => record.hoaId === hoaId) ?? null;
    } catch (error) {
      console.error('Error getting subscription info:', error);
      return null;
    }
  },

  async upsertSubscription(record: SubscriptionRecord): Promise<void> {
    try {
      const appData = await this.getAppData();
      const index = appData.subscriptions.findIndex((entry) => entry.hoaId === record.hoaId);
      if (index >= 0) {
        appData.subscriptions[index] = record;
      } else {
        appData.subscriptions.push(record);
      }
      await this.setAppData(appData);
    } catch (error) {
      console.error('Error saving subscription info:', error);
      throw error;
    }
  },

  // Authentication helper
  async authenticateUser(hoaId: string, email: string, pin: string): Promise<User | null> {
    try {
      const appData = await this.getAppData();
      
      // Check if resident exists
      const resident = appData.residents.find(
        r => r.hoaId === hoaId && r.email === email && r.pin === pin
      );

      if (resident) {
        // Use explicit role from resident record (production-ready)
        return { ...resident, role: resident.role };
      }

      return null;
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  },

  // Initialize with demo data for testing
  async initializeDemoData(): Promise<void> {
    try {
      const appData = await this.getAppData();
      
      // Only initialize if no data exists
      if (appData.residents.length === 0) {
        appData.hoaId = 'hoa001';
        appData.residents = [
          { 
            email: 'admin@hoa001.com', 
            pin: '1234', 
            hoaId: 'hoa001',
            role: 'admin',
            createdAt: new Date().toISOString()
          },
          { 
            email: 'resident@hoa001.com', 
            pin: '5678', 
            hoaId: 'hoa001',
            role: 'homeowner',
            createdAt: new Date().toISOString()
          },
        ];

        const demoPlan = buildSubscriptionRecord('hoa001');
        const subIndex = appData.subscriptions.findIndex((entry) => entry.hoaId === 'hoa001');
        if (subIndex >= 0) {
          appData.subscriptions[subIndex] = demoPlan;
        } else {
          appData.subscriptions.push(demoPlan);
        }
        
        await this.setAppData(appData);
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  },

  // HOA Registration (Production-ready)
  async registerHOA(registration: HOARegistration): Promise<{ success: boolean; adminPin: string; plan?: SubscriptionRecord; error?: string }> {
    try {
      const { hoaId, hoaName, adminEmail, adminName } = registration;
      
      const appData = await this.getAppData();
      
      // Check if HOA already exists
      if (appData.residents.some(r => r.hoaId === hoaId)) {
        return { success: false, adminPin: '', error: 'HOA ID already exists' };
      }

      // Generate secure PIN using crypto
      const adminPin = await this.generateSecurePin();
      
      // Create admin user
      const admin: Resident = {
        email: adminEmail,
        pin: adminPin,
        hoaId,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      const planRecord = buildSubscriptionRecord(hoaId);

      // Update app data
      appData.hoaId = hoaId;
      appData.residents.push(admin);

      const subscriptionIndex = appData.subscriptions.findIndex((entry) => entry.hoaId === hoaId);
      if (subscriptionIndex >= 0) {
        appData.subscriptions[subscriptionIndex] = planRecord;
      } else {
        appData.subscriptions.push(planRecord);
      }

      await this.setAppData(appData);

      return { success: true, adminPin, plan: planRecord };
    } catch (error) {
      console.error('Error registering HOA:', error);
      return { success: false, adminPin: '', error: 'Registration failed' };
    }
  },

  // Generate cryptographically secure PIN
  async generateSecurePin(): Promise<string> {
    try {
      // Use expo-crypto for production-grade security
      const Crypto = require('expo-crypto');
      const randomBytes = await Crypto.getRandomBytesAsync(2);
      const randomNumber = (randomBytes[0] << 8) | randomBytes[1];
      return (1000 + (randomNumber % 9000)).toString();
    } catch (error) {
      // Fallback to Math.random if crypto unavailable
      console.warn('Crypto unavailable, falling back to Math.random()');
      return Math.floor(1000 + Math.random() * 9000).toString();
    }
  },
};
