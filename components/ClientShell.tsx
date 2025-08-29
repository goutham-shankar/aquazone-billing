"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import AuthProvider, { useAuth } from "../providers/AuthProvider";
import Navigation from "./Navigation";
import { TopNav } from "./TopNav";
import { ThemeProvider } from "./theme-provider";
import { Toaster } from "react-hot-toast";
import toast from "react-hot-toast";

// Haptic feedback types
const HapticType = {
  SUCCESS: "success",
  ERROR: "error",
  CLICK: "click",
} as const;

// Haptic patterns for different feedback types
const hapticPatterns = {
  [HapticType.SUCCESS]: [200, 30, 200], // Success: medium-pause-medium
  [HapticType.ERROR]: [50, 30, 50, 30, 50], // Error: three short vibrations
  [HapticType.CLICK]: [100], // Click: short vibration
};

// Define the HapticType type properly
type HapticType = (typeof HapticType)[keyof typeof HapticType];

// Trigger haptic feedback function with proper typing
const triggerHaptic = (type: HapticType): void => {
  // Check if we're in the browser and if the vibration API is supported
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.vibrate === "function"
  ) {
    navigator.vibrate(hapticPatterns[type]);
  }
};

export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="light" storageKey="aquazone-theme">
      <AuthProvider>
        <AuthGate>
          <div className="flex h-screen">
            <Navigation />
            <div className="flex-1 flex flex-col overflow-hidden">
              <TopNav />
              <main className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
                {children}
              </main>
            </div>
          </div>
        </AuthGate>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--popover)",
              color: "var(--popover-foreground)",
              backdropFilter: "blur(8px)",
              border: "1px solid var(--border)",
              borderRadius: "8px",
            },
            success: {
              iconTheme: {
                primary: "#4ade80",
                secondary: "var(--popover)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "var(--popover)",
              },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading, signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hapticsSupported, setHapticsSupported] = useState(false);

  // Check if haptics are supported
  useEffect(() => {
    if (
      typeof navigator !== "undefined" &&
      typeof navigator.vibrate === "function"
    ) {
      setHapticsSupported(true);
    }
  }, []);

  const handleGoogleSignIn = async () => {
    // Trigger click haptic feedback when button is pressed
    if (hapticsSupported) {
      triggerHaptic(HapticType.CLICK);
    }

    setIsLoading(true);

    try {
      await signInWithGoogle();

      // Success haptic feedback
      if (hapticsSupported) {
        triggerHaptic(HapticType.SUCCESS);
      }
    } catch (error: unknown) {
      // Using unknown type instead of any
      const errorMessage =
        error instanceof Error ? error.message : "Failed to login";

      // Error haptic feedback
      if (hapticsSupported) {
        triggerHaptic(HapticType.ERROR);
      }

      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center text-gray-600 dark:text-gray-300">
        <div className="flex flex-col items-center space-y-4">
          <svg
            className="animate-spin h-8 w-8 text-gray-600 dark:text-gray-300"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen overflow-y-hidden flex items-center justify-center bg-gradient-to-br from-black via-zinc-900 to-black py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background elements for glassmorphic effect */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-indigo-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-40 left-1/2 w-64 h-64 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>

        <div className="max-w-md w-full space-y-8 relative z-10">
          <div className="backdrop-blur-lg bg-white/10 p-8 rounded-2xl shadow-xl border border-white/20">
            <div className="flex justify-center">
              {/* Brand logo */}
              <div className="relative mb-2">
                <Image
                  src="/logo_golden.svg"
                  alt="AquaZone Logo"
                  width={200}
                  height={200}
                  className="rounded-full"
                  onError={(e) => {
                    console.warn("Logo image failed to load:", e);
                  }}
                />
              </div>
            </div>

            <div>
              <h2 className="text-center text-3xl font-extrabold text-white">
                Sign in to your account
              </h2>
              <p className="mt-2 text-center text-sm text-gray-300">
                New Golden AquaZone Inventory Management
              </p>
            </div>

            <div className="mt-8 space-y-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-black hover:bg-zinc-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 backdrop-blur-sm transition-all duration-200 ease-in-out shadow-lg cursor-pointer hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center">
                    <svg
                      className="mr-3"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                        <path
                          fill="#4285F4"
                          d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"
                        />
                        <path
                          fill="#34A853"
                          d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"
                        />
                        <path
                          fill="#EA4335"
                          d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"
                        />
                      </g>
                    </svg>
                    Sign in with Google
                  </span>
                )}
              </button>

              <div className="mt-4 text-xs text-gray-300 text-center">
                By signing in, you agree to our terms of service and privacy policy.
              </div>
            </div>
          </div>
        </div>

        {/* Add tailwind animation styles */}
        <style jsx>{`
          @keyframes blob {
            0% {
              transform: translate(0px, 0px) scale(1);
            }
            33% {
              transform: translate(30px, -50px) scale(1.1);
            }
            66% {
              transform: translate(-20px, 20px) scale(0.9);
            }
            100% {
              transform: translate(0px, 0px) scale(1);
            }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  return <>{children}</>;
}