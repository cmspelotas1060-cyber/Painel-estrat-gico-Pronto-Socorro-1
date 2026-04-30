import { doc, getDoc, setDoc, deleteDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';
import { db, auth } from './firebase';

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

export const storage = {
  /**
   * Get item from localStorage synchronously (safe JSON parse)
   * Use this only for UI state that doesn't need cloud persistence (e.g. toggles)
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
   * Get item from Firestore with localStorage caching
   */
  async getItem(key: string, defaultValue: any = null) {
    // 1. Try local cache first for speed
    const local = localStorage.getItem(key);
    
    // 2. Try Firestore
    const path = `app_data/${key}`;
    try {
      const docRef = doc(db, 'app_data', key);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data().data;
        // Update local cache
        localStorage.setItem(key, typeof data === 'string' ? data : JSON.stringify(data));
        return data;
      }
    } catch (err) {
      console.warn(`Firestore read failed for ${key}, falling back to local:`, err);
      // If Firestore fails (e.g. offline or permission), fallback to local cache
    }

    if (local) {
      try {
        return JSON.parse(local);
      } catch {
        return local;
      }
    }

    return defaultValue;
  },

  /**
   * Set item in both localStorage and Firestore
   */
  async setItem(key: string, value: any) {
    // 1. Save locally for immediate UI update
    const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, stringValue);

    // Dispatch event so other components in the same window can react
    window.dispatchEvent(new Event('storage'));

    // 2. Save to Firestore
    const path = `app_data/${key}`;
    try {
      const docRef = doc(db, 'app_data', key);
      await setDoc(docRef, {
        id: key,
        data: value,
        updatedAt: serverTimestamp()
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  },

  /**
   * Remove item from both
   */
  async removeItem(key: string) {
    localStorage.removeItem(key);
    const path = `app_data/${key}`;
    try {
      const docRef = doc(db, 'app_data', key);
      await deleteDoc(docRef);
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
};

/**
 * Legacy sync service renamed for compatibility but using Firebase under the hood
 */
export const syncService = {
  async get(key: string) {
    return storage.getItem(key);
  },
  async set(key: string, value: any) {
    return storage.setItem(key, value);
  },
  async getShare(shareId: string) {
    try {
      const docRef = doc(db, 'shares', shareId);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? docSnap.data().payload : null;
    } catch (err) {
      console.error("Firebase share read error:", err);
      return null;
    }
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
    // Actually pulls from Firestore now
    try {
      const querySnapshot = await getDocs(collection(db, 'app_data'));
      querySnapshot.forEach((doc) => {
        const item = doc.data();
        const value = typeof item.data === 'string' ? item.data : JSON.stringify(item.data);
        localStorage.setItem(doc.id, value);
      });
    } catch (err) {
      console.error("Firebase pull error:", err);
    }
  },
  async syncAllLocalToSupabase() {
    // Actually syncs to Firestore now
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
