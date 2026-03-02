import { getDatabase, type Database } from 'firebase/database';
import { app, hasValidDatabaseUrl } from '@/lib/firebase';

// Firebase Realtime Database — solo se inicializa si NEXT_PUBLIC_FIREBASE_DATABASE_URL está definida y es válida.
// Si no (o si getDatabase lanza, ej. en build de Vercel sin URL), rtdb es null y la app carga igual.
let _rtdb: Database | null = null;
if (hasValidDatabaseUrl) {
  try {
    _rtdb = getDatabase(app);
  } catch {
    // En build (Vercel) sin URL válida puede lanzar "Cannot parse Firebase url"; evitamos romper el build.
    _rtdb = null;
  }
}
export const rtdb: Database | null = _rtdb;
