"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    // Check for redirect result
    getRedirectResult(auth).then((result) => {
      if (result) {
        console.log('Sign-in successful via redirect:', result.user.email);
      }
    }).catch((error) => {
      console.error('Error getting redirect result:', error);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      console.log('Firebase config:', {
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
      });
      
      const provider = new GoogleAuthProvider();
      
      // Add additional scopes if needed
      provider.addScope('email');
      provider.addScope('profile');
      
      // Try popup first, fallback to redirect
      try {
        console.log('Attempting to sign in with popup...');
        const result = await signInWithPopup(auth, provider);
        console.log('Sign-in successful:', result.user.email);
      } catch (popupError: any) {
        console.log('Popup failed, trying redirect...', popupError.code);
        
        if (popupError.code === 'auth/popup-closed-by-user' || 
            popupError.code === 'auth/popup-blocked' ||
            popupError.code === 'auth/cancelled-popup-request') {
          
          console.log('Using redirect fallback...');
          await signInWithRedirect(auth, provider);
          return; // Redirect will happen, no need to throw error
        }
        
        throw popupError; // Re-throw if it's not a popup-related error
      }
      
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      
      // Log specific error details
      if (error.code) {
        console.error('Error code:', error.code);
      }
      if (error.message) {
        console.error('Error message:', error.message);
      }
      
      // Handle specific error cases
      if (error.code === 'auth/unauthorized-domain') {
        console.error('Domain not authorized in Firebase console');
        alert('Authentication error: Domain not authorized. Please check Firebase console settings.');
      } else if (error.code === 'auth/popup-blocked') {
        console.error('Popup was blocked by browser');
        alert('Please allow popups for this site and try again.');
      } else {
        alert(`Authentication error: ${error.message || 'Unknown error occurred'}`);
      }
      
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signInWithGoogle,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
} 