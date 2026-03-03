/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

// Create client with fallback to empty strings to avoid crash on initialization
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

/**
 * Generic data sync service
 */
export const syncService = {
  /**
   * Fetch data from Supabase by key
   */
  async get(key: string) {
    try {
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('id', key)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data?.data;
    } catch (err) {
      console.error(`Error fetching key ${key} from Supabase:`, err);
      return null;
    }
  },

  /**
   * Save data to Supabase by key
   */
  async set(key: string, value: any) {
    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({ id: key, data: value, updated_at: new Date().toISOString() });

      if (error) throw error;
    } catch (err) {
      console.error(`Error saving key ${key} to Supabase:`, err);
    }
  },

  /**
   * Create a shareable link by saving data to Supabase
   */
  async createShare(data: any) {
    try {
      const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const key = `share_${shareId}`;
      await this.set(key, data);
      return shareId;
    } catch (err) {
      console.error('Error creating share:', err);
      throw err;
    }
  },

  /**
   * Get shared data from Supabase
   */
  async getShare(shareId: string) {
    return await this.get(`share_${shareId}`);
  },

  /**
   * Sync all local data to Supabase (Initial migration)
   */
  async syncAllLocalToSupabase() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('supabase.auth.')) {
        keys.push(key);
      }
    }

    for (const key of keys) {
      const localValue = localStorage.getItem(key);
      if (localValue) {
        try {
          const parsed = JSON.parse(localValue);
          await this.set(key, parsed);
        } catch {
          await this.set(key, localValue);
        }
      }
    }
  }
};
