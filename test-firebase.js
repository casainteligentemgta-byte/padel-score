
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAExkCMW5KYOMBO-7tW_fuWd6rCZYlC-c0",
    authDomain: "padel-score-pro-777.firebaseapp.com",
    projectId: "padel-score-pro-777",
    storageBucket: "padel-score-pro-777.firebasestorage.app",
    messagingSenderId: "725028600303",
    appId: "1:725028600303:web:11052e1fff30c047051e1a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function test() {
    console.log("Testing Firestore connection...");
    try {
        const snap = await getDocs(collection(db, 'tournaments'));
        console.log("Success! Found", snap.size, "tournaments.");
        process.exit(0);
    } catch (e) {
        console.error("Firestore Error:", e);
        process.exit(1);
    }
}

test();
