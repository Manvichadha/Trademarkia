import { initializeApp, type FirebaseApp, getApps } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getDatabase, type Database } from "firebase/database";

interface FirebaseClients {
  app: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
  realtimeDb: Database;
}

let clients: FirebaseClients | null = null;

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
} as const;

function assertConfig(key: keyof typeof firebaseConfig): void {
  if (!firebaseConfig[key]) {
    throw new Error(
      `Missing Firebase config value for "${key}". Check your environment variables.`,
    );
  }
}

export function getFirebaseClients(): FirebaseClients {
  if (clients) {
    return clients;
  }

  // Validate required config keys eagerly in development
  if (process.env.NODE_ENV !== "production") {
    assertConfig("apiKey");
    assertConfig("authDomain");
    assertConfig("projectId");
    assertConfig("appId");
    assertConfig("databaseURL");
  }

  const app =
    getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0]!;

  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const realtimeDb = getDatabase(app);

  clients = { app, auth, firestore, realtimeDb };
  return clients;
}

export type { FirebaseClients };

