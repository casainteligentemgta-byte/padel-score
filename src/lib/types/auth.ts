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

export type ProfileStatus = 'PENDING' | 'COMPLETE';

/**
 * Perfil progresivo de usuario (tabla `profiles`).
 * `is_ghost = true`: creado por admin sin onboarding completo.
 */
export interface Profile {
    id: string; // UUID de Supabase Auth
    email: string;
    full_name: string;
    avatar_url?: string | null;
    phone?: string | null;
    is_ghost: boolean;
    status: ProfileStatus;
}
