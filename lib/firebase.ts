// Firebase initialization and exports
// Uses NEXT_PUBLIC_ env vars to configure on the client
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    } as const;

    if (!config.apiKey || !config.authDomain || !config.projectId || !config.appId) {
      // Soft-fail: allow app to render but warn for missing config
      if (typeof window !== "undefined") {
        // eslint-disable-next-line no-console
        console.warn("Firebase config missing. Set NEXT_PUBLIC_FIREBASE_* env vars.");
      }
    }

    app = getApps()[0] ?? initializeApp(config as any);
  }
  return app!;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}
