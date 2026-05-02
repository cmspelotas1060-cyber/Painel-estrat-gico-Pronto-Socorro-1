import { syncService } from './supabase';

export const storage = {
  /**
   * Get item from localStorage synchronously (safe JSON parse)
   */
  getSync(key: string, defaultValue: any = null) {
    const local = localStorage.getItem(key);
    if (!local) return defaultValue;
    try {
      return JSON.parse(local);
    } catch {
      return local || defaultValue;
    }
  },

  /**
   * Get item from localStorage with Supabase fallback/sync
   */
  async getItem(key: string, defaultValue: any = null) {
    // 1. Try local first for speed
    const local = localStorage.getItem(key);
    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return local;
      }
    }

    // 2. Try Supabase if local is empty
    const remote = await syncService.get(key);
    if (remote !== null) {
      // Cache locally
      localStorage.setItem(key, typeof remote === 'string' ? remote : JSON.stringify(remote));
      return remote;
    }

    return defaultValue;
  },

  /**
   * Set item in both localStorage and Supabase
   */
  async setItem(key: string, value: any) {
    // 1. Save locally
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);

    // Dispatch event so other components in the same window can react
    window.dispatchEvent(new Event('storage'));

    // 2. Save to Supabase (async, don't block UI)
    syncService.set(key, value).catch(err => console.error('Supabase sync error:', err));
  },

  /**
   * Remove item from both
   */
  async removeItem(key: string) {
    localStorage.removeItem(key);
    // Note: We don't necessarily delete from Supabase to prevent accidental data loss, 
    // but we could if needed.
  }
};
