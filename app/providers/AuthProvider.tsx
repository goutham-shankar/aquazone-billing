"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";

type AuthCtx = {
  user: User | null;
  loading: boolean;
  token?: string;
  signInDemo: () => Promise<void>;
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
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) setToken(await u.getIdToken());
      else setToken(undefined);
      setLoading(false);
    });
    return () => unsub();
  }, [auth]);

  const value = useMemo<AuthCtx>(() => ({
    user,
    loading,
    token,
    signInDemo: async () => {
      const email = process.env.NEXT_PUBLIC_DEMO_EMAIL;
      const password = process.env.NEXT_PUBLIC_DEMO_PASSWORD;
      if (!email || !password) return;
      await signInWithEmailAndPassword(auth, email, password);
    },
    signOutApp: async () => {
      await signOut(auth);
    }
  }), [user, loading, token, auth]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
