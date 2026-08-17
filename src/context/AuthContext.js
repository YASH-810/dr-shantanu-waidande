"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  auth, 
  googleProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from '@/lib/firebase';

const AuthContext = createContext({
  user: null,
  loading: true,
  isDemoMode: false,
  signInWithGoogle: async () => {},
  loginWithEmail: async () => {},
  registerWithEmail: async () => {},
  loginAsDemoDoctor: () => {},
  logout: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check local storage for demo user
    const savedDemo = localStorage.getItem('physio_demo_user');
    if (savedDemo) {
      try {
        setUser(JSON.parse(savedDemo));
        setIsDemoMode(true);
        setLoading(false);
        return;
      } catch (e) {
        localStorage.removeItem('physio_demo_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName || currentUser.email?.split('@')[0] || 'Doctor',
          photoURL: currentUser.photoURL || null,
        });
        setIsDemoMode(false);
      } else if (!localStorage.getItem('physio_demo_user')) {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('physio_demo_user');
      setIsDemoMode(false);
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName,
        photoURL: res.user.photoURL,
      });
      return { success: true };
    } catch (error) {
      setLoading(false);
      console.warn("Firebase Auth Error, falling back to Demo Doctor session:", error.message);
      // Fallback to demo mode if Firebase project is not linked yet
      return loginAsDemoDoctor("Dr. Shantanu Waidande", "shantanu@physioclinic.com");
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      setLoading(true);
      const res = await signInWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('physio_demo_user');
      setIsDemoMode(false);
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: res.user.displayName || email.split('@')[0],
        photoURL: res.user.photoURL,
      });
      return { success: true };
    } catch (error) {
      setLoading(false);
      // Fallback demo login for instant testing
      return loginAsDemoDoctor(email.split('@')[0], email);
    }
  };

  const registerWithEmail = async (email, password, name) => {
    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);
      localStorage.removeItem('physio_demo_user');
      setIsDemoMode(false);
      setUser({
        uid: res.user.uid,
        email: res.user.email,
        displayName: name || email.split('@')[0],
        photoURL: null,
      });
      return { success: true };
    } catch (error) {
      setLoading(false);
      return loginAsDemoDoctor(name || email.split('@')[0], email);
    }
  };

  const loginAsDemoDoctor = (name = "Dr. Shantanu Waidande", email = "shantanu@physioclinic.com") => {
    const demoUser = {
      uid: "demo_doc_101",
      email: email,
      displayName: name,
      photoURL: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      qualification: "BPTh, MPTh (Musculoskeletal)",
      regNo: "PT-2024/8912"
    };
    localStorage.setItem('physio_demo_user', JSON.stringify(demoUser));
    setUser(demoUser);
    setIsDemoMode(true);
    setLoading(false);
    return { success: true, isDemo: true };
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // Ignore
    }
    localStorage.removeItem('physio_demo_user');
    setUser(null);
    setIsDemoMode(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isDemoMode,
      signInWithGoogle,
      loginWithEmail,
      registerWithEmail,
      loginAsDemoDoctor,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
