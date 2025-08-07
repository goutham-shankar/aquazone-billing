"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import app from "../lib/firebase"; // your firebase config file
import toast from "react-hot-toast";

type AuthContextType = {
  user: User | null;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  getIdToken: () => Promise<string | null>;
  loading: boolean;
  error: string | null;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const auth = getAuth(app);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return unsubscribe;
  }, [auth]);

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const idToken = await result.user.getIdToken();

      // Validate user with your API
      const validateResponse = await fetch(`https://x2zlcvi4af.execute-api.ap-south-1.amazonaws.com/dev/user/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ email: result.user.email }),
      });

      const validation = await validateResponse.json();
      if (!validation.exists) {
        // User not validated, sign them out and show error
        await signOut(auth);
        setUser(null);
        setError("User not validated. Please contact an administrator.");
        toast.error("User not validated. Please contact an administrator.");
        return;
      } else {
        setUser(result.user);
        window.location.href = "/";
      }

    } catch (error) {
      console.error("Google sign-in error:", error);
      setError("Sign-in failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    await signOut(auth);
    setUser(null);
  };

  // Add the getIdToken function for API requests
  const getIdToken = async (): Promise<string | null> => {
    try {
      if (!user) {
        return null;
      }
      // This uses Firebase's getIdToken method to get a fresh token
      return await user.getIdToken(true);
    } catch (error) {
      console.error("Error getting ID token:", error);
      return null;
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, signInWithGoogle, logout, getIdToken, loading, error }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}