/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Check your environment variables.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

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
   * Sync all local data to Supabase (Initial migration)
   */
  async syncAllLocalToSupabase() {
    const keys = [
      'ps_monthly_detailed_stats',
      'ps_available_years',
      'ps_ppa_full_data_v2',
      'rdqa_full_indicators',
      'cms_conference_proposals_v2',
      'dashboard_v3_layout',
      'ui_menu_config'
    ];

    // Also dynamic keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('ui_text_') || key.startsWith('ui_notes_ids_'))) {
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
