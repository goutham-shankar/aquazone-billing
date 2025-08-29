"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  type User as FirebaseUser 
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import toast from "react-hot-toast";

// Custom user type from the backend API
type User = {
  id: string;
  email: string;
  name: string;
  role: string;
};

type AuthCtx = {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  loading: boolean;
  token?: string;
  signInWithGoogle: () => Promise<void>;
  signOutApp: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | undefined>(undefined);

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = getFirebaseAuth();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

  // Function to authenticate with backend using Firebase token
  const validateUser = async (firebaseToken: string): Promise<User | null> => {
    try {
      const { api } = await import("@/lib/api");
      const response = await api.auth.signinWithToken(firebaseToken);
      
      if (response.success && response.user) {
        return {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name,
          role: response.user.role,
        };
      } else {
        console.error("Backend authentication failed:", (response as any).error || 'Unknown error');
        return null;
      }
    } catch (error) {
      console.error("Error authenticating with backend:", error);
      return null;
    }
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const firebaseToken = await firebaseUser.getIdToken();
          setToken(firebaseToken);
          
          const validatedUser = await validateUser(firebaseToken);
          if (validatedUser) {
            setUser(validatedUser);
          } else {
            toast.error("User validation failed.");
            setUser(null);
            setToken(undefined);
          }
        } catch (error) {
          console.error("Error during authentication:", error);
          setUser(null);
          setToken(undefined);
        }
      } else {
        setUser(null);
        setToken(undefined);
      }
      
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  const value = useMemo<AuthCtx>(() => ({
    user,
    firebaseUser,
    loading,
    token,
    signInWithGoogle: async () => {
      try {
        const provider = new GoogleAuthProvider();
        provider.addScope('email');
        provider.addScope('profile');
        
        await signInWithPopup(auth, provider);
      } catch (error: any) {
        console.error("Google sign-in error:", error);
        // Handle specific error cases
        if (error.code === 'auth/popup-closed-by-user') {
          console.log("Sign-in popup was closed by user");
        } else if (error.code === 'auth/popup-blocked') {
          console.error("Sign-in popup was blocked by browser");
        }
        throw error; // Re-throw so UI can handle the error
      }
    },
    signOutApp: async () => {
      await signOut(auth);
    }
  }), [user, firebaseUser, loading, token, auth]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
