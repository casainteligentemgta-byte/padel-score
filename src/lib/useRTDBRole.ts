import { useEffect, useState } from 'react';
import { ref, onValue, off } from 'firebase/database';
import { rtdb } from '@/lib/rtdb';

export interface RTDBUserRole {
    rol: 'admin' | 'marker' | 'player' | null;
    canchaAsignada: string | null; // ej: "cancha_1"
    nombre: string | null;
    loading: boolean;
}

/**
 * Hook que sincroniza el rol del usuario desde RTDB en tiempo real.
 * Si el uid es null (no autenticado), retorna loading:false con rol null.
 */
export function useRTDBRole(uid: string | undefined | null): RTDBUserRole {
    const [state, setState] = useState<RTDBUserRole>({
        rol: null,
        canchaAsignada: null,
        nombre: null,
        loading: true,
    });

    useEffect(() => {
        if (!uid) {
            setState({ rol: null, canchaAsignada: null, nombre: null, loading: false });
            return;
        }
        if (!rtdb) {
            setState({ rol: null, canchaAsignada: null, nombre: null, loading: false });
            return;
        }

        const userRef = ref(rtdb, `usuarios_roles/${uid}`);
        const handleValue = (snap: any) => {
            const data = snap.val();
            setState({
                rol: data?.rol ?? null,
                canchaAsignada: data?.cancha_asignada ?? null,
                nombre: data?.nombre ?? null,
                loading: false,
            });
        };

        onValue(userRef, handleValue, (err) => {
            console.error('[useRTDBRole] Error leyendo rol:', err);
            setState(prev => ({ ...prev, loading: false }));
        });

        return () => off(userRef, 'value', handleValue);
    }, [uid]);

    return state;
}
