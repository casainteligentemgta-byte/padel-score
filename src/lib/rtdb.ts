import { getDatabase } from 'firebase/database';
import { app } from '@/lib/firebase';

// Firebase Realtime Database — instancia única
// La URL debe estar en NEXT_PUBLIC_FIREBASE_DATABASE_URL en .env.local
export const rtdb = getDatabase(app);
