import { getDatabase, type Database } from 'firebase/database';
import { app, firebaseConfig } from '@/lib/firebase';

let _rtdb: Database | null = null;
if (firebaseConfig.databaseURL) {
  try {
    _rtdb = getDatabase(app);
  } catch (e) {
    console.warn('[rtdb] Failed to initialize Realtime Database:', e);
    _rtdb = null;
  }
}
export const rtdb: Database | null = _rtdb;
