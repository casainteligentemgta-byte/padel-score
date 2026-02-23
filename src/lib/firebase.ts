import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyAExkCMW5KYOMBO-7tW_fuWd6rCZYlC-c0",
    authDomain: "padel-score-pro-777.firebaseapp.com",
    projectId: "padel-score-pro-777",
    storageBucket: "padel-score-pro-777.firebasestorage.app",
    messagingSenderId: "725028600303",
    appId: "1:725028600303:web:11052e1fff30c047051e1a"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, storage, googleProvider, firebaseConfig };
