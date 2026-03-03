import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Realtime Database logic
const databaseUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();
let databaseURL: string | undefined = undefined;

if (databaseUrl) {
  // Si es una URL de consola, intentamos extraer la base o usar el default de Firebase
  if (databaseUrl.includes('console.firebase.google.com')) {
    databaseURL = `https://padel-score-pro-777-default-rtdb.firebaseio.com`;
  } else {
    databaseURL = databaseUrl;
  }
}

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL,
};

// Validate essential config — no inicializar en build si faltan vars (evita auth/invalid-api-key en Vercel)
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
if (!hasConfig && typeof window !== 'undefined') {
  console.error("CRITICAL: Firebase configuration is missing essential environment variables (API Key or Project ID).");
}

let app: ReturnType<typeof getApp> | null = null;
if (hasConfig) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  } catch (e) {
    if (typeof window !== 'undefined') console.error("Firebase init failed:", e);
  }
}

const auth = app ? getAuth(app) : (null as any);
const db = app ? getFirestore(app) : (null as any);
const storage = app ? getStorage(app) : (null as any);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };

