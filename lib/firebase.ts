import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, where, orderBy, doc, deleteDoc, updateDoc, serverTimestamp, Timestamp, limit, getDoc } from 'firebase/firestore';

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
  id: string
  userId: string
  mode: string
  title: string
  content: string
  timestamp: any
  metadata?: {
    wordCount: number
    characterCount: number
  }
  corruptionLevel?: number
  isPublic: boolean
  hiddenLayers?: number
  timeLocked?: boolean
  unlockTime?: any
}

export interface UserProfile {
  id?: string
  userId: string
  displayName: string
  bio?: string
  avatarUrl?: string
  joinDate: any
  totalEntries: number
  publicEntries: number
  favoriteMode?: string
  achievements?: UserAchievement[]
}

export interface UserAchievement {
  achievementId: number
  unlockedAt: string | undefined  // ISO timestamp string
  progress?: number
  maxProgress?: number
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

// Get public diary entries for a user (for profile viewing)
export const getPublicDiaryEntries = async (userId: string, limitCount: number = 20) => {
  try {
    const q = query(
      collection(db, 'diary_entries'),
      where('userId', '==', userId),
      where('isPublic', '==', true),
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
    
    // Sort by timestamp (newest first)
    entries.sort((a, b) => {
      const timestampA = a.timestamp?.toDate ? a.timestamp.toDate() : new Date(a.timestamp);
      const timestampB = b.timestamp?.toDate ? b.timestamp.toDate() : new Date(b.timestamp);
      return timestampB.getTime() - timestampA.getTime();
    });
    
    return entries;
  } catch (error: any) {
    console.error('Error getting public diary entries:', error);
    throw error;
  }
};

// Get all public entries from all users (for discovery)
export const getAllPublicEntries = async (limitCount: number = 50) => {
  try {
    const q = query(
      collection(db, 'diary_entries'),
      where('isPublic', '==', true),
      orderBy('timestamp', 'desc'),
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
    
    return entries;
  } catch (error: any) {
    console.error('Error getting all public entries:', error);
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

// Create or update user profile
export const createUserProfile = async (profile: Omit<UserProfile, 'id' | 'joinDate' | 'lastActive'>) => {
  try {
    // Filter out undefined values to prevent Firestore errors
    const cleanProfile = Object.fromEntries(
      Object.entries(profile).filter(([_, value]) => value !== undefined)
    ) as Omit<UserProfile, 'id' | 'joinDate' | 'lastActive'>
    
    const profileData = {
      ...cleanProfile,
      joinDate: serverTimestamp(),
      lastActive: serverTimestamp()
    };
    
    // Check if profile already exists
    const existingProfile = await getUserProfile(profile.userId);
    
    if (existingProfile) {
      // Update existing profile
      const profileRef = doc(db, 'user_profiles', existingProfile.id!);
      await updateDoc(profileRef, {
        ...profileData,
        lastActive: serverTimestamp()
      });
      return { id: existingProfile.id, ...profileData };
    } else {
      // Create new profile
      const docRef = await addDoc(collection(db, 'user_profiles'), profileData);
      return { id: docRef.id, ...profileData };
    }
  } catch (error: any) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const q = query(
      collection(db, 'user_profiles'),
      where('userId', '==', userId),
      limit(1)
    );
    
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) {
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as UserProfile;
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Reset user profile (useful for fixing corrupted profiles)
export const resetUserProfile = async (userId: string) => {
  try {
    // Delete existing profile
    const existingProfile = await getUserProfile(userId);
    if (existingProfile && existingProfile.id) {
      await deleteDoc(doc(db, 'user_profiles', existingProfile.id));
    }
    
    // Clear cache
    for (const [key] of entryCache) {
      if (key.includes(userId)) {
        entryCache.delete(key);
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Error resetting user profile:', error);
    throw error;
  }
};

// Achievement-related functions
export const unlockAchievement = async (userId: string, achievementId: number): Promise<void> => {
  try {
    // First, get the user profile to find the correct document ID
    const userProfile = await getUserProfile(userId)
    if (!userProfile || !userProfile.id) {
      console.error(`🏆 Cannot unlock achievement: User profile not found for ${userId}`)
      return
    }
    
    const userRef = doc(db, 'user_profiles', userProfile.id)
    
    // Get current achievements
    const userDoc = await getDoc(userRef)
    const currentAchievements = userDoc.data()?.achievements || []
    
    // Check if achievement is already unlocked
    const existingAchievement = currentAchievements.find((a: UserAchievement) => a.achievementId === achievementId)
    if (existingAchievement?.unlockedAt) {
      console.log(`🏆 Achievement ${achievementId} already unlocked`)
      return
    }
    
    // Create a proper timestamp that Firestore can handle
    const unlockTimestamp = new Date().toISOString()
    
    // Add new achievement or update existing one
    if (existingAchievement) {
      // Update existing achievement
      existingAchievement.unlockedAt = unlockTimestamp
      existingAchievement.progress = existingAchievement.maxProgress
    } else {
      // Add new achievement
      const newAchievement: UserAchievement = {
        achievementId,
        unlockedAt: unlockTimestamp,
        progress: 1,
        maxProgress: 1
      }
      currentAchievements.push(newAchievement)
    }
    
    await updateDoc(userRef, {
      achievements: currentAchievements
    })
    
    console.log(`🏆 Achievement ${achievementId} unlocked successfully at ${unlockTimestamp}`)
  } catch (error) {
    console.error('Error unlocking achievement:', error)
    throw error
  }
}

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
  try {
    // First, get the user profile to find the correct document ID
    const userProfile = await getUserProfile(userId)
    if (!userProfile || !userProfile.id) {
      console.log(`🏆 No user profile found for ${userId}, returning empty achievements`)
      return []
    }
    
    const userRef = doc(db, 'user_profiles', userProfile.id)
    const userDoc = await getDoc(userRef)
    
    if (userDoc.exists()) {
      return userDoc.data()?.achievements || []
    }
    
    return []
  } catch (error) {
    console.error('Error getting user achievements:', error)
    return []
  }
}

export const updateAchievementProgress = async (userId: string, achievementId: number, progress: number, maxProgress: number): Promise<void> => {
  try {
    // First, get the user profile to find the correct document ID
    const userProfile = await getUserProfile(userId)
    if (!userProfile || !userProfile.id) {
      console.error(`🏆 Cannot update achievement progress: User profile not found for ${userId}`)
      return
    }
    
    const userRef = doc(db, 'user_profiles', userProfile.id)
    
    // Get current achievements
    const userDoc = await getDoc(userRef)
    const currentAchievements = userDoc.data()?.achievements || []
    
    // Find and update existing achievement or add new one
    const achievementIndex = currentAchievements.findIndex((a: UserAchievement) => a.achievementId === achievementId)
    
    if (achievementIndex >= 0) {
      // Update existing achievement
      currentAchievements[achievementIndex].progress = progress
      currentAchievements[achievementIndex].maxProgress = maxProgress
      
      // Unlock if progress reaches max
      if (progress >= maxProgress && !currentAchievements[achievementIndex].unlockedAt) {
        currentAchievements[achievementIndex].unlockedAt = new Date().toISOString()
      }
    } else {
      // Add new achievement
      const newAchievement: UserAchievement = {
        achievementId,
        unlockedAt: progress >= maxProgress ? new Date().toISOString() : undefined,
        progress,
        maxProgress
      }
      currentAchievements.push(newAchievement)
    }
    
    await updateDoc(userRef, {
      achievements: currentAchievements
    })
  } catch (error) {
    console.error('Error updating achievement progress:', error)
    throw error
  }
}

export const checkAndUnlockAchievements = async (userId: string, userProfile: UserProfile, entries: DiaryEntry[]): Promise<void> => {
  try {
    // Calculate totals from entries
    const totalWords = entries.reduce((sum, entry) => sum + (entry.metadata?.wordCount || 0), 0)
    const totalEntries = entries.length
    const publicEntries = entries.filter(entry => entry.isPublic).length
    
    console.log(`🔍 [ACHIEVEMENT DEBUG] Checking achievements for user ${userId}:`, {
      totalWords,
      totalEntries,
      publicEntries,
      profileTotalEntries: userProfile.totalEntries,
      profilePublicEntries: userProfile.publicEntries
    })
    
    // Check various achievement conditions
    const achievementsToCheck = [
      { id: 1, condition: () => totalEntries > 0, name: "First Whisper" },
      { id: 2, condition: () => totalWords >= 100, name: "The First Page" },
      { id: 3, condition: () => totalWords >= 500, name: "A Thousand Thoughts" },
      { id: 4, condition: () => totalWords >= 1000, name: "Ink River" },
      { id: 5, condition: () => totalWords >= 5000, name: "Word Mountain" },
      { id: 6, condition: () => totalEntries >= 2, name: "Day One Flame" },
      { id: 7, condition: () => totalEntries >= 3, name: "The Third Dawn" },
      { id: 8, condition: () => totalEntries >= 7, name: "Week of Whispers" },
      { id: 9, condition: () => totalEntries >= 14, name: "The Fortnight Flame" },
      { id: 10, condition: () => totalEntries >= 30, name: "The Moon's Cycle" },
      { id: 11, condition: () => totalEntries >= 90, name: "Seasoned Scribe" },
      { id: 12, condition: () => totalEntries >= 365, name: "The Yearling Writer" },
      { id: 13, condition: () => totalEntries >= 500, name: "Unbroken Chain" },
      { id: 14, condition: () => totalEntries >= 1000, name: "Eternal Streak" },
      { id: 15, condition: () => totalEntries >= 2000, name: "Diary Deity" },
      { id: 19, condition: () => totalEntries >= 50, name: "Memory Keeper" },
      { id: 20, condition: () => totalEntries >= 100, name: "Digital Archivist" },
      { id: 24, condition: () => publicEntries >= 5, name: "Public Speaker" },
      { id: 51, condition: () => totalEntries >= 100, name: "Century Club" },
      { id: 52, condition: () => totalEntries >= 50, name: "Halfway There" },
      { id: 53, condition: () => totalEntries >= 25, name: "Quarter Master" },
      { id: 54, condition: () => totalEntries >= 10, name: "Decade" },
      { id: 55, condition: () => totalEntries >= 5, name: "First Five" }
    ]
    
    for (const achievement of achievementsToCheck) {
      if (achievement.condition()) {
        console.log(`🏆 [ACHIEVEMENT DEBUG] Unlocking achievement: ${achievement.name} (ID: ${achievement.id})`)
        await unlockAchievement(userId, achievement.id)
      }
    }
  } catch (error) {
    console.error('Error checking achievements:', error)
  }
}

export default app; 