"use client";
import { useEffect, useState } from "react";
import AuthProvider, { useAuth } from "./providers/AuthProvider";
import GlobalSearch from "./components/GlobalSearch";
import { Toaster } from "react-hot-toast";

export default function ClientShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const isMac = /Mac/i.test(navigator.platform);
      const ctrlOrMeta = isMac ? e.metaKey : e.ctrlKey;
      if (ctrlOrMeta && e.key.toLowerCase() === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <AuthProvider>
      <AuthGate>
        <div className="h-screen grid grid-rows-[64px,1fr]">
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="w-full px-6 h-16 flex items-center justify-between gap-4">
              <div className="text-xl font-semibold tracking-tight text-slate-800">Aquazone Billing</div>
              <div className="flex-1">
                <input
                  type="search"
                  placeholder="Search customers, products, invoices... (Ctrl+F)"
                  className="w-full h-11 px-4 rounded-md border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  onFocus={() => setSearchOpen(true)}
                />
              </div>
            </div>
          </header>
          <main className="overflow-hidden bg-slate-50">{children}</main>
        </div>
      </AuthGate>
      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signInDemo } = useAuth();
  if (loading) return <div className="min-h-screen grid place-items-center text-gray-500">Loading…</div>;
  if (!user) {
    const hasDemo = Boolean(process.env.NEXT_PUBLIC_DEMO_EMAIL && process.env.NEXT_PUBLIC_DEMO_PASSWORD);
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="w-[420px] border rounded-xl p-6 shadow-sm">
          <div className="text-xl font-semibold mb-2">Sign in required</div>
          <p className="text-sm text-gray-600 mb-4">Please sign in with Firebase to use Aquazone Billing.</p>
          {hasDemo && (
            <button className="w-full h-11 rounded-md bg-sky-600 text-white" onClick={signInDemo}>Sign in with demo account</button>
          )}
          {!hasDemo && (
            <div className="text-sm text-gray-500">Set NEXT_PUBLIC_DEMO_EMAIL and NEXT_PUBLIC_DEMO_PASSWORD for a demo sign-in button.</div>
          )}
        </div>
      </div>
    );
  }
  return <>{children}</>;
}
