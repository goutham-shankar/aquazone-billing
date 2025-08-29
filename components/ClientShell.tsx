"use client";
import { useEffect, useState } from "react";
import { User, LogOut } from "lucide-react";
import AuthProvider, { useAuth } from "../providers/AuthProvider";
import Navigation from "./Navigation";
import Image from "next/image";
import { Toaster } from "react-hot-toast";

function UserMenu() {
  const { user, signOutApp } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu')) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showMenu]);

  if (!user) return null;

  return (
    <div className="relative user-menu">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
      >
        <User className="w-6 h-6 text-gray-600" />
        <span className="text-md font-medium text-gray-700">{user.name}</span>
      </button>

      {showMenu && (
        <div className="user-menu-dropdown absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-400 mt-1">Role: {user.role}</div>
          </div>
          <div className="p-2 space-y-1">
            <button
              onClick={() => {
                signOutApp();
                setShowMenu(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <div className="grid">
          <header className="border-b border-gray-200 bg-white shadow-sm">
            <div className="w-full px-4 h-15 flex items-center justify-between">
              <div className="text-base font-semibold tracking-tight text-gray-900">
                <Image src="/logo.svg" alt="Aquazone Billing" width={70} height={40} className="object-contain"/>
              </div>
              <UserMenu />
            </div>
          </header>
          <div className="flex h-screen">
            <Navigation />
            <main className="flex-1 overflow-hidden bg-gray-50">{children}</main>
          </div>
        </div>
      </AuthGate>
      <Toaster position="top-right" />
    </AuthProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const [signingIn, setSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigningIn(true);
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Sign-in failed:", error);
      // The error is already logged in the auth provider
    } finally {
      setSigningIn(false);
    }
  };

  if (loading) return <div className="min-h-screen grid place-items-center text-gray-600">Loading…</div>;
  
  if (!user) {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50">
        <div className="w-[420px] border border-gray-200 rounded-xl p-6 shadow-sm bg-white">
          <div className="text-center mb-6">
            <div className="text-xl font-semibold mb-2 text-gray-900">Welcome to Aquazone Billing</div>
            <p className="text-sm text-gray-600">Sign in with your Google account to continue</p>
          </div>
          
          <button 
            onClick={handleGoogleSignIn}
            disabled={signingIn}
            className="google-signin-btn w-full h-11 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {signingIn ? (
              <div className="loading-spinner w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full" />
            ) : (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {signingIn ? "Signing in..." : "Continue with Google"}
          </button>
          
          <div className="mt-4 text-xs text-gray-500 text-center">
            By signing in, you agree to our terms of service and privacy policy.
          </div>
        </div>
      </div>
    );
  }
  
  return <>{children}</>;
}
