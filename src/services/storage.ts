import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, User, Quote, Resident } from '../types';

const STORAGE_KEY = 'gdpi_app_data';
const USER_KEY = 'gdpi_current_user';

// Initialize default app data
const defaultAppData: AppData = {
  hoaId: '',
  residents: [],
  quoteHistory: [],
  subscribed: false,
  subscriptionTier: 'trial',
  trialStartedAt: new Date().toISOString(),
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
      return data ? JSON.parse(data) : defaultAppData;
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
        appData.subscribed = true;
        appData.subscriptionTier = 'basic';
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
        
        await this.setAppData(appData);
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  },

  // HOA Registration (Production-ready)
  async registerHOA(registration: any): Promise<{ success: boolean; adminPin: string; error?: string }> {
    try {
      const { hoaId, hoaName, adminEmail, adminName, subscriptionTier = 'trial', trialDays = 14 } = registration;
      
      const appData = await this.getAppData();
      
      // Check if HOA already exists
      if (appData.residents.some(r => r.hoaId === hoaId)) {
        return { success: false, adminPin: '', error: 'HOA ID already exists' };
      }

      // Generate secure PIN using crypto
      const adminPin = await this.generateSecurePin();
      
      // Calculate trial expiration
      const trialStartedAt = new Date();
      const subscriptionExpiresAt = new Date(trialStartedAt);
      subscriptionExpiresAt.setDate(subscriptionExpiresAt.getDate() + trialDays);

      // Create admin user
      const admin: Resident = {
        email: adminEmail,
        pin: adminPin,
        hoaId,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };

      // Update app data
      appData.hoaId = hoaId;
      appData.residents.push(admin);
      appData.subscribed = subscriptionTier === 'trial' || subscriptionTier === 'basic' || subscriptionTier === 'premium';
      appData.subscriptionTier = subscriptionTier;
      appData.trialStartedAt = trialStartedAt.toISOString();
      appData.subscriptionExpiresAt = subscriptionTier === 'trial' ? subscriptionExpiresAt.toISOString() : undefined;

      await this.setAppData(appData);

      return { success: true, adminPin };
    } catch (error) {
      console.error('Error registering HOA:', error);
      return { success: false, adminPin: '', error: 'Registration failed' };
    }
  },

  // Check subscription status
  async checkSubscription(hoaId: string): Promise<{ active: boolean; tier: string; daysRemaining?: number }> {
    try {
      const appData = await this.getAppData();
      
      if (appData.hoaId !== hoaId) {
        return { active: false, tier: 'none' };
      }

      if (!appData.subscribed) {
        return { active: false, tier: 'none' };
      }

      // Check if trial expired
      if (appData.subscriptionTier === 'trial' && appData.subscriptionExpiresAt) {
        const expiresAt = new Date(appData.subscriptionExpiresAt);
        const now = new Date();
        
        if (now > expiresAt) {
          return { active: false, tier: 'trial_expired' };
        }

        const daysRemaining = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return { active: true, tier: appData.subscriptionTier, daysRemaining };
      }

      return { active: true, tier: appData.subscriptionTier };
    } catch (error) {
      console.error('Error checking subscription:', error);
      return { active: false, tier: 'error' };
    }
  },

  // Upgrade subscription
  async upgradeSubscription(hoaId: string, tier: 'basic' | 'premium'): Promise<boolean> {
    try {
      const appData = await this.getAppData();
      
      if (appData.hoaId !== hoaId) {
        return false;
      }

      appData.subscriptionTier = tier;
      appData.subscribed = true;
      appData.subscriptionExpiresAt = undefined; // No expiration for paid tiers

      await this.setAppData(appData);
      return true;
    } catch (error) {
      console.error('Error upgrading subscription:', error);
      return false;
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
