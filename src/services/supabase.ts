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
 * Helper helpers to preserve key ordering for objects stored as PostgreSQL JSONB
 */
const attachKeyOrder = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => attachKeyOrder(item));
  }
  const copy: any = {};
  const keys = Object.keys(obj);
  for (const k of keys) {
    copy[k] = attachKeyOrder(obj[k]);
  }
  copy.__serialized_key_order = keys;
  return copy;
};

const restoreKeyOrder = (obj: any): any => {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) {
    return obj.map(item => restoreKeyOrder(item));
  }
  
  // Restore children first
  const withRestoredChildren: any = {};
  for (const k in obj) {
    if (k !== '__serialized_key_order') {
      withRestoredChildren[k] = restoreKeyOrder(obj[k]);
    }
  }

  if (obj.__serialized_key_order && Array.isArray(obj.__serialized_key_order)) {
    const orderedKeys = obj.__serialized_key_order;
    const orderedObj: any = {};
    for (const key of orderedKeys) {
      if (key in withRestoredChildren) {
        orderedObj[key] = withRestoredChildren[key];
      }
    }
    // Copy any extra keys that might have been added later
    for (const key in withRestoredChildren) {
      if (!(key in orderedObj)) {
        orderedObj[key] = withRestoredChildren[key];
      }
    }
    return orderedObj;
  }

  return withRestoredChildren;
};

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
      return restoreKeyOrder(data?.data);
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
      throw new Error('Supabase não configurado corretamente. Por favor, configure as variáveis de ambiente VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no AI Studio.');
    }

    try {
      const orderedValue = attachKeyOrder(value);
      const { error } = await supabase
        .from('app_data')
        .upsert({ id: key, data: orderedValue, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Supabase error detail:', error);
        throw new Error(`Erro no Supabase (${error.code}): ${error.message}`);
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || String(err).includes('fetch')) {
        throw new Error(
          'Falha de rede ao conectar ao Supabase (Failed to fetch).\n\n' +
          'Seu projeto no Supabase provavelmente está PAUSADO devido à inatividade ou as variáveis de ambiente expiraram.\n\n' +
          'Como reativar:\n' +
          '1. Acesse o painel: https://supabase.com/dashboard\n' +
          '2. Selecione seu projeto (pewryzjatufmxdxpfzfg) e clique em "Restore Project" (Restaurar) para reativá-lo.\n' +
          '3. Verifique se o status mudou para "Active".\n\n' +
          'A sincronização voltará a funcionar imediatamente após a reativação.'
        );
      }
      console.error(`Error saving key ${key} to Supabase:`, err);
      throw err;
    }
  },

  /**
   * Create a shareable link by saving data to Supabase
   */
  async createShare(data: any) {
    if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
      throw new Error('Supabase não configurado corretamente. Por favor, configure as variáveis de ambiente no painel de configurações.');
    }

    try {
      // Use the generic app_data table space for share IDs as well
      const shareId = 'id_' + Math.random().toString(36).substring(2, 11) + Math.random().toString(36).substring(2, 11);
      const orderedData = attachKeyOrder(data);

      const { error } = await supabase
        .from('app_data')
        .upsert({ id: shareId, data: orderedData, updated_at: new Date().toISOString() });

      if (error) {
        console.error('Supabase share error:', error);
        throw new Error(`Erro ao criar compartilhamento (${error.code}): ${error.message}`);
      }

      return shareId;
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || String(err).includes('fetch')) {
        throw new Error(
          'Falha de rede ao conectar ao Supabase (Failed to fetch).\n\n' +
          'Seu projeto no Supabase provavelmente está PAUSADO devido à inatividade ou as variáveis de ambiente expiraram.\n\n' +
          'Como reativar:\n' +
          '1. Acesse o painel: https://supabase.com/dashboard\n' +
          '2. Selecione seu projeto (pewryzjatufmxdxpfzfg) e clique em "Restore Project" (Restaurar) para reativá-lo.\n' +
          '3. Verifique se o status mudou para "Active".\n\n' +
          'O link de compartilhamento começará a funcionar imediatamente após a reativação.'
        );
      }
      console.error('Error creating share:', err);
      throw err;
    }
  },

  /**
   * Get shared data from Supabase
   */
  async getShare(shareId: string) {
    try {
      let dataToReturn = null;

      // 1. Try exact shareId query
      const { data, error } = await supabase
        .from('app_data')
        .select('data')
        .eq('id', shareId)
        .single();

      if (!error && data) {
        dataToReturn = data.data;
      } else if (error && !shareId.startsWith('id_')) {
        // Fallback: Try checking with 'id_' prefix
        const { data: fbData, error: fbError } = await supabase
          .from('app_data')
          .select('data')
          .eq('id', `id_${shareId}`)
          .single();
        if (!fbError && fbData) {
          dataToReturn = fbData.data;
        }
      } else if (error && shareId.startsWith('id_')) {
        // Fallback: Try checking without 'id_' prefix
        const cleanId = shareId.substring(3);
        const { data: fbData, error: fbError } = await supabase
          .from('app_data')
          .select('data')
          .eq('id', cleanId)
          .single();
        if (!fbError && fbData) {
          dataToReturn = fbData.data;
        }
      }

      return restoreKeyOrder(dataToReturn);
    } catch (err) {
      console.error(`Error fetching share ${shareId}:`, err);
      return null;
    }
  },

  /**
   * Sync all local data to Supabase (Initial migration)
   */
  async syncAllLocalToSupabase() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('supabase.auth.') && !key.startsWith('ui_') && !key.startsWith('id_')) {
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
  },

  /**
   * Pull all data from Supabase to LocalStorage
   */
  async pullAllFromSupabase() {
    if (!isValidUrl(supabaseUrl) || !supabaseAnonKey) {
      throw new Error('Supabase não configurado.');
    }

    try {
      // 1. Cleanup legacy share keys from local storage to free up quota
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('id_') || key.startsWith('supabase.auth.'))) {
          localStorage.removeItem(key);
        }
      }

      const { data, error } = await supabase
        .from('app_data')
        .select('id, data');

      if (error) {
        throw error;
      }

      if (data) {
        for (const item of data) {
          if (item.id.startsWith('id_') || item.id.startsWith('supabase.auth.') || item.id.startsWith('ui_')) {
            continue;
          }

          let parsedCloud = item.data;
          if (typeof item.data === 'string') {
            try {
              parsedCloud = JSON.parse(item.data);
            } catch (e) {
              parsedCloud = item.data;
            }
          }
          const restored = restoreKeyOrder(parsedCloud);
          const value = typeof restored === 'string' ? restored : JSON.stringify(restored);
          
          // SAFETY CHECK: Don't overwrite local storage if local storage has data 
          // and cloud data is fundamentally empty ({}, [], or null)
          const localValue = localStorage.getItem(item.id);
          if (localValue) {
            try {
              const isCloudEmpty = !restored || 
                                  (typeof restored === 'object' && Object.keys(restored).filter(k => k !== '__serialized_key_order').length === 0) ||
                                  (Array.isArray(restored) && restored.length === 0);
              
              if (isCloudEmpty) {
                console.log(`Skipping sync for ${item.id} because cloud data is empty and local data exists.`);
                continue;
              }
            } catch (e) {
              // If we can't parse it, better be safe
            }
          }

          localStorage.setItem(item.id, value);
        }
      }
    } catch (err: any) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError' || String(err).includes('fetch')) {
        throw new Error(
          'Falha de rede ao puxar dados do Supabase (Failed to fetch).\n\n' +
          'Seu projeto no Supabase provavelmente está PAUSADO devido à inatividade.\n\n' +
          'Abra o dashboard da Supabase https://supabase.com/dashboard e clique em "Restore Project" para reativá-lo.'
        );
      }
      console.error('Error pulling data from Supabase:', err);
      throw err;
    }
  }
};
