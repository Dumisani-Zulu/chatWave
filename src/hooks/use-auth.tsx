
"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  updateUserProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  firebaseUser: null,
  loading: true,
  updateUserProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (fbUser) => {
      setFirebaseUser(fbUser);
      // Let the other useEffect handle loading state based on user doc presence
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (firebaseUser) {
      setLoading(true);
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const unsubscribeSnapshot = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          setUser(doc.data() as User);
        } else {
          // This can happen briefly during registration before the user doc is created.
          // The AuthGuard will show a loader.
          setUser(null); 
        }
        setLoading(false);
      });
      return () => unsubscribeSnapshot();
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [firebaseUser]);

  const updateUserProfile = async (data: Partial<User>) => {
    if (firebaseUser) {
      const userDocRef = doc(db, "users", firebaseUser.uid);
      await updateDoc(userDocRef, data);
    }
  };

  const value = { user, firebaseUser, loading, updateUserProfile };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
