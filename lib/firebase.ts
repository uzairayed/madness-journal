import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, serverTimestamp, Timestamp } from 'firebase/firestore';

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

// Save a new diary entry
export const saveDiaryEntry = async (entry: Omit<DiaryEntry, 'id' | 'timestamp'>) => {
  try {
    const docRef = await addDoc(collection(db, 'diary_entries'), {
      ...entry,
      timestamp: serverTimestamp(),
    });
    
    return { id: docRef.id, ...entry };
  } catch (error) {
    console.error('Error saving diary entry:', error);
    throw error;
  }
};

// Get all diary entries for a user (simplified query to avoid index issues)
export const getUserDiaryEntries = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'diary_entries'),
      where('userId', '==', userId)
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
    
    return entries;
  } catch (error) {
    console.error('Error getting diary entries:', error);
    throw error;
  }
};

// Get diary entries by mode (simplified query)
export const getDiaryEntriesByMode = async (userId: string, mode: string) => {
  try {
    const q = query(
      collection(db, 'diary_entries'),
      where('userId', '==', userId),
      where('mode', '==', mode)
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
    
    return entries;
  } catch (error) {
    console.error('Error getting diary entries by mode:', error);
    throw error;
  }
};

// Delete a diary entry
export const deleteDiaryEntry = async (entryId: string) => {
  try {
    await deleteDoc(doc(db, 'diary_entries', entryId));
    return true;
  } catch (error) {
    console.error('Error deleting diary entry:', error);
    throw error;
  }
};

// Update a diary entry
export const updateDiaryEntry = async (entryId: string, updates: Partial<DiaryEntry>) => {
  try {
    const entryRef = doc(db, 'diary_entries', entryId);
    await updateDoc(entryRef, {
      ...updates,
      lastModified: serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error updating diary entry:', error);
    throw error;
  }
};

export default app; 