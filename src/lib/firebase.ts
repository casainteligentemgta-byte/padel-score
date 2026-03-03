import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

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

// Validate essential config — en cliente avisamos si faltan, en servidor toleramos para no romper build
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
if (!hasConfig && typeof window !== 'undefined') {
  console.error("CRITICAL: Firebase configuration is missing essential environment variables (API Key or Project ID).");
}

let app: FirebaseApp | null = null;
try {
  if (hasConfig) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
} catch (e) {
  // No lanzar: así la app carga y el usuario ve login/errores en vez de pantalla en blanco.
  console.error("Firebase init failed (app cargará sin auth):", e);
  app = null;
}

let auth: Auth;
let db: Firestore;
let storage: FirebaseStorage;
const googleProvider = new GoogleAuthProvider();

if (app) {
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} else {
  // Stubs mínimos para evitar crashes en build/SSR; en runtime real no deberían usarse.
  auth = undefined as unknown as Auth;
  db = undefined as unknown as Firestore;
  storage = undefined as unknown as FirebaseStorage;
}

export { app, auth, db, storage, googleProvider };

