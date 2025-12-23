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
        appData.residents[index] = { ...appData.residents[index], ...updates };
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
        // Determine role - for simplicity, email containing 'admin' is admin
        const role = email.toLowerCase().includes('admin') ? 'admin' : 'homeowner';
        return { ...resident, role };
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
          { email: 'admin@hoa001.com', pin: '1234', hoaId: 'hoa001' },
          { email: 'resident@hoa001.com', pin: '5678', hoaId: 'hoa001' },
        ];
        
        await this.setAppData(appData);
      }
    } catch (error) {
      console.error('Error initializing demo data:', error);
    }
  },
};
