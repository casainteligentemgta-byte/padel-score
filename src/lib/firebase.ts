import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Realtime Database: opcional. Solo la raíz (sin rutas). Ejemplo: https://padel-score-pro-777-default-rtdb.us-central1.firebasedatabase.app
const projectId = "padel-score-pro-777";
const rawDbUrl = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL?.trim();
let databaseUrlRoot: string | null = null;
if (rawDbUrl && rawDbUrl.startsWith("https://") && (rawDbUrl.includes("firebaseio.com") || rawDbUrl.includes("firebasedatabase.app"))) {
  try {
    databaseUrlRoot = new URL(rawDbUrl).origin;
  } catch {
    databaseUrlRoot = null;
  }
}
export const hasValidDatabaseUrl = Boolean(databaseUrlRoot);

export const firebaseConfig = {
    apiKey: "AIzaSyAExkCMW5KYOMBO-7tW_fuWd6rCZYlC-c0",
    authDomain: "padel-score-pro-777.firebaseapp.com",
    projectId,
    storageBucket: "padel-score-pro-777.firebasestorage.app",
    messagingSenderId: "725028600303",
    appId: "1:725028600303:web:11052e1fff30c047051e1a",
    ...(hasValidDatabaseUrl && databaseUrlRoot && { databaseURL: databaseUrlRoot }),
};

// Initialize Firebase (singleton pattern)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider };

