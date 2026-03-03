/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Helper to check if a string is a valid URL
const isValidUrl = (url: string | undefined): boolean => {
  if (!url) return false;
  try {
    new URL(url);
    return url.startsWith('http');
  } catch {
    return false;
  }
};

const finalUrl = isValidUrl(supabaseUrl) ? supabaseUrl! : 'https://placeholder.supabase.co';
const finalKey = supabaseAnonKey || 'placeholder';

if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
  console.warn('Supabase URL ou Anon Key inválidos ou ausentes. O app funcionará apenas localmente até que as variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY sejam configuradas corretamente no AI Studio.');
}

// Create client with validated URL
export const supabase = createClient(finalUrl, finalKey);

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
    if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
      throw new Error('Supabase não configurado corretamente. Por favor, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no AI Studio com valores válidos.');
    }

    try {
      const { error } = await supabase
        .from('app_data')
        .upsert({ id: key, data: value, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Supabase error detail:', error);
        throw new Error(`Erro no Supabase (${error.code}): ${error.message}`);
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        throw new Error('Falha de rede ao conectar ao Supabase. Verifique sua conexão ou se a URL do Supabase está correta e acessível.');
      }
      console.error(`Error saving key ${key} to Supabase:`, err);
      throw err;
    }
  },

  /**
   * Create a shareable link by saving data to Supabase
   */
  async createShare(data: any) {
    try {
      // Basic size check (approximate)
      const dataStr = JSON.stringify(data);
      const sizeInMB = dataStr.length / (1024 * 1024);
      if (sizeInMB > 1) {
        throw new Error(`Dados muito grandes para compartilhar (${sizeInMB.toFixed(2)}MB). O limite é de 1MB.`);
      }

      const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const key = `share_${shareId}`;
      // Ensure we await and the error propagates
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
