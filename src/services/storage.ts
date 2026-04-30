import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, auth } from './firebase';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

let supabase: any = null;
if (supabaseUrl && supabaseKey && supabaseUrl !== 'your_supabase_project_url') {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
  } catch (err) {
    console.error("Failed to initialize Supabase for migration:", err);
  }
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const listeners: Record<string, () => void> = {};

export const storage = {
  getSync(key: string, defaultValue: any = null) {
    const local = localStorage.getItem(key);
    if (!local) return defaultValue;
    try {
      return JSON.parse(local);
    } catch {
      return local || defaultValue;
    }
  },

  async getItem(key: string, defaultValue: any = null) {
    const local = localStorage.getItem(key);
    try {
      const docRef = doc(db, 'app_data', key);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data().data;
        localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn(`Firestore read failed for ${key}, falling back to local:`, err);
    }
    if (local) {
      try { return JSON.parse(local); } catch { return local; }
    }
    return defaultValue;
  },

  async setItem(key: string, value: any) {
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);
    window.dispatchEvent(new Event('storage'));
    try {
      const docRef = doc(db, 'app_data', key);
      await setDoc(docRef, {
        id: key,
        data: value,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `app_data/${key}`);
    }
  },

  async removeItem(key: string) {
    localStorage.removeItem(key);
    try {
      const docRef = doc(db, 'app_data', key);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `app_data/${key}`);
    }
  },

  subscribe(key: string, callback: (data: any) => void) {
    if (listeners[key]) return () => {};
    const docRef = doc(db, 'app_data', key);
    listeners[key] = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const cloudData = snapshot.data().data;
        const local = localStorage.getItem(key);
        const stringifiedCloud = typeof cloudData === 'string' ? cloudData : JSON.stringify(cloudData);
        if (local !== stringifiedCloud) {
          localStorage.setItem(key, stringifiedCloud);
          window.dispatchEvent(new Event('storage'));
          callback(cloudData);
        }
      }
    });
    return () => {
      if (listeners[key]) {
        listeners[key]();
        delete listeners[key];
      }
    };
  }
};

export const syncService = {
  async get(key: string) { return storage.getItem(key); },
  async set(key: string, value: any) { return storage.setItem(key, value); },
  async getShare(shareId: string) {
    try {
      const docRef = doc(db, 'shares', shareId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data().payload;
      }
    } catch (err) {
      console.warn("Firebase share read error, attempting Supabase fallback:", err);
    }

    // Fallback to Supabase for old links
    if (supabase) {
      try {
        console.log("Checking for legacy share in Supabase...");
        const { data, error } = await supabase
          .from('shares')
          .select('payload')
          .eq('id', shareId)
          .single();
        
        if (!error && data) {
          console.log("Legacy share found in Supabase.");
          return data.payload;
        }
      } catch (err) {
        console.warn("Supabase share fallback failed:", err);
      }
    }
    return null;
  },
  async createShare(data: any) {
    const id = `share_${Date.now()}`;
    try {
      await setDoc(doc(db, 'shares', id), {
        payload: data,
        createdAt: serverTimestamp()
      });
      return id;
    } catch (err) {
      console.error("Firebase share creation error:", err);
      throw err;
    }
  },
  async pullAllFromSupabase() {
    if (supabase) {
      try {
        const { data: supabaseItems, error } = await supabase.from('app_data').select('*');
        if (!error && supabaseItems && supabaseItems.length > 0) {
          for (const item of supabaseItems) {
            await this.set(item.id, item.data);
          }
          return "migrated";
        }
      } catch (err) {
        console.warn("Supabase migration failed:", err);
      }
    }
    try {
      const querySnapshot = await getDocs(collection(db, 'app_data'));
      if (querySnapshot.empty) {
        await this.syncAllLocalToSupabase();
        return "synced_local";
      } else {
        querySnapshot.forEach((doc) => {
          const item = doc.data();
          const value = typeof item.data === 'string' ? item.data : JSON.stringify(item.data);
          localStorage.setItem(doc.id, value);
        });
        return "pulled";
      }
    } catch (err) {
      console.error("Firebase pull error:", err);
      return "error";
    }
  },
  async syncAllLocalToSupabase() {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && !key.startsWith('firebase:') && !key.startsWith('ui_')) {
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
