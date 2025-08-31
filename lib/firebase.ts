import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, serverTimestamp, Timestamp, limit } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

// Simple in-memory cache for entries
interface CacheEntry {
  data: DiaryEntry[];
  timestamp: number;
}

const entryCache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Firestore functions for diary entries
export interface DiaryEntry {
  id?: string;
  userId: string;
  mode: string;
  title: string;
  content: string;
  timestamp: Timestamp | any; // Firestore timestamp
  corruptionLevel?: number;
  hiddenLayers?: number;
  timeLocked?: boolean;
  unlockTime?: Timestamp | any;
  isAlternative?: boolean;
  realityVariant?: string;
  metadata?: {
    wordCount: number;
    characterCount: number;
    writingDuration?: number;
  };
}

// Save a new diary entry (optimized)
export const saveDiaryEntry = async (entry: Omit<DiaryEntry, 'id' | 'timestamp'>) => {
  try {
    // Add timestamp before saving
    const entryWithTimestamp = {
      ...entry,
      timestamp: serverTimestamp(),
    };
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('Save operation timed out'))
      }, 10000); // 10 second timeout
    });
    
    const savePromise = addDoc(collection(db, 'diary_entries'), entryWithTimestamp);
    const docRef = await Promise.race([savePromise, timeoutPromise]) as any;
    
    // Invalidate all cache entries for this user
    for (const [key] of entryCache) {
      if (key.includes(entry.userId)) {
        entryCache.delete(key);
      }
    }
    
    return { id: docRef.id, ...entry };
  } catch (error: any) {
    console.error('Error saving diary entry:', error);
    throw error;
  }
};

// Get all diary entries for a user (optimized with caching and pagination)
export const getUserDiaryEntries = async (userId: string, limitCount: number = 50) => {
  try {
    // Check cache first
    const cacheKey = `${userId}_${limitCount}`;
    const cached = entryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Optimized query with limit and no complex ordering
    const q = query(
      collection(db, 'diary_entries'),
      where('userId', '==', userId),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: DiaryEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({ 
        id: doc.id, 
        ...data 
      } as DiaryEntry);
    });
    
    // Sort entries by timestamp in JavaScript (client-side)
    entries.sort((a, b) => {
      const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime(); // Descending order
    });
    
    // Cache the result
    entryCache.set(cacheKey, {
      data: entries,
      timestamp: Date.now()
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting diary entries:', error);
    throw error;
  }
};

// Get diary entries by mode (optimized)
export const getDiaryEntriesByMode = async (userId: string, mode: string, limitCount: number = 20) => {
  try {
    // Check cache first
    const cacheKey = `${userId}_${mode}_${limitCount}`;
    const cached = entryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    // Optimized query with limit
    const q = query(
      collection(db, 'diary_entries'),
      where('userId', '==', userId),
      where('mode', '==', mode),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: DiaryEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({ 
        id: doc.id, 
        ...data 
      } as DiaryEntry);
    });
    
    // Sort entries by timestamp in JavaScript
    entries.sort((a, b) => {
      const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    });
    
    // Cache the result
    entryCache.set(cacheKey, {
      data: entries,
      timestamp: Date.now()
    });
    
    return entries;
  } catch (error) {
    console.error('Error getting diary entries by mode:', error);
    throw error;
  }
};

// Get recent entries (fast query for dashboard)
export const getRecentEntries = async (userId: string, count: number = 5) => {
  try {
    const cacheKey = `${userId}_recent_${count}`;
    const cached = entryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    
    const q = query(
      collection(db, 'diary_entries'),
      where('userId', '==', userId),
      limit(count)
    );
    
    const querySnapshot = await getDocs(q);
    const entries: DiaryEntry[] = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      entries.push({ 
        id: doc.id, 
        ...data 
      } as DiaryEntry);
    });
    
    // Sort by timestamp
    entries.sort((a, b) => {
      const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    });
    
    // Cache the result
    entryCache.set(cacheKey, {
      data: entries,
      timestamp: Date.now()
    });
    
    return entries;
  } catch (error) {
    console.error('Error getting recent entries:', error);
    throw error;
  }
};

// Delete a diary entry (optimized)
export const deleteDiaryEntry = async (entryId: string, userId: string) => {
  try {
    await deleteDoc(doc(db, 'diary_entries', entryId));
    
    // Invalidate all caches for this user
    for (const [key] of entryCache) {
      if (key.includes(userId)) {
        entryCache.delete(key);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    throw error;
  }
};

// Update a diary entry (optimized)
export const updateDiaryEntry = async (entryId: string, updates: Partial<DiaryEntry>, userId: string) => {
  try {
    const entryRef = doc(db, 'diary_entries', entryId);
    await updateDoc(entryRef, {
      ...updates,
      lastModified: serverTimestamp(),
    });
    
    // Invalidate all caches for this user
    for (const [key] of entryCache) {
      if (key.includes(userId)) {
        entryCache.delete(key);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error updating diary entry:', error);
    throw error;
  }
};

// Clear cache (useful for testing or manual refresh)
export const clearCache = () => {
  entryCache.clear();
};

export default app; 