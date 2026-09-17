import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../models';

const TOKEN_KEY = '@taskflow_auth_token';
const USER_KEY = '@taskflow_user_data';

export const storageService = {
  async saveAuthData(token: string, user: User): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem(TOKEN_KEY, token),
        AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
      ]);
    } catch (error) {
      console.error('[StorageService] Error saving auth data:', error);
    }
  },

  async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(TOKEN_KEY);
    } catch (error) {
      console.error('[StorageService] Error reading auth token:', error);
      return null;
    }
  },

  async getUserData(): Promise<User | null> {
    try {
      const data = await AsyncStorage.getItem(USER_KEY);
      return data ? (JSON.parse(data) as User) : null;
    } catch (error) {
      console.error('[StorageService] Error reading user data:', error);
      return null;
    }
  },

  async clearAuthData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.removeItem(TOKEN_KEY),
        AsyncStorage.removeItem(USER_KEY),
      ]);
    } catch (error) {
      console.error('[StorageService] Error clearing auth data:', error);
    }
  },
};
