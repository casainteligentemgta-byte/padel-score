import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";

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

async function testWrite() {
    console.log("Starting Firestore write test...");
    try {
        const docRef = await addDoc(collection(db, "tournaments"), {
            name: "Test Tournament " + Date.now(),
            ownerId: "system-test",
            status: "En Curso",
            createdAt: new Date(),
            test: true
        });
        console.log("Success! Document written with ID:", docRef.id);
    } catch (e) {
        console.error("Error writing document:", e);
    }
    process.exit();
}

testWrite();
