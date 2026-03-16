/**
 * Hook que devuelve el rol del usuario desde Supabase (profiles).
 * Sustituye la lectura desde Firebase RTDB (usuarios_roles) para centralizar en Supabase.
 * Mantiene la misma interfaz RTDBUserRole para no romper componentes.
 */
import { useAuth } from '@/lib/AuthContext';

export interface RTDBUserRole {
    rol: 'admin' | 'marker' | 'player' | null;
    canchaAsignada: string | null;
    nombre: string | null;
    loading: boolean;
}

export function useRTDBRole(uid: string | undefined | null): RTDBUserRole {
    const { profile, loading: authLoading } = useAuth();

    if (!uid) {
        return { rol: null, canchaAsignada: null, nombre: null, loading: false };
    }

    const role = profile?.role as 'admin' | 'marker' | 'player' | undefined;
    const markerCanchas: string[] = Array.isArray(profile?.markerCanchas) ? profile.markerCanchas : [];
    const canchaAsignada = markerCanchas.length > 0 ? markerCanchas[0] : null;
    const nombre = profile?.name ?? null;

    return {
        rol: role ?? null,
        canchaAsignada,
        nombre,
        loading: authLoading,
    };
}
