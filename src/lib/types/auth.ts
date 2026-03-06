/**
 * Usuario de la app (compatible con Firebase User para migración a Supabase).
 * Supabase usa user.id (UUID); exponemos también uid = id para no cambiar toda la app.
 */
export interface AppUser {
    uid: string;
    id: string;
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
}
