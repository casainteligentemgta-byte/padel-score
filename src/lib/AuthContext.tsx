'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    signInAnonymously
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { dataService, ROLES } from '@/lib/dataService';

interface AuthContextType {
    user: User | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    enableDevMode: () => void | Promise<void>;
    logout: () => Promise<void>;
    /** Admin: acceso total */
    isAdmin: boolean;
    /** Jugador: solo ver pizarras, tablas de posiciones y torneos */
    isPlayer: boolean;
    /** Marcador: ver + acceder al marcador solo en las canchas asignadas */
    isMarker: boolean;
    /** Canchas en las que el marcador está autorizado a marcar (ej. ['cancha_1', 'cancha_3']) */
    markerCanchas: string[];
    /** true si el usuario puede marcar en esta cancha (admin o marcador con esa cancha asignada) */
    canMarkInCancha: (canchaId: string) => boolean;
    /** Recarga el perfil desde Firestore (útil tras actualizar en Mi cuenta) */
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
    signInWithGoogle: async () => { },
    signInWithEmail: async () => { },
    signUpWithEmail: async () => { },
    forgotPassword: async () => { },
    enableDevMode: () => { },
    logout: async () => { },
    isAdmin: false,
    isPlayer: false,
    isMarker: false,
    markerCanchas: [],
    canMarkInCancha: () => false,
    refreshProfile: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // MODO DESARROLLADOR: Simulación con sesión real
    const enableDevMode = async () => {
        const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL?.trim();
        const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD?.trim();

        if (devEmail && devPassword) {
            try {
                await signInWithEmailAndPassword(auth, devEmail, devPassword);
                return;
            } catch (e) {
                console.warn('AuthContext: Simulación falló:', e);
            }
        }

        // Fallback: anonymous login to have a real Firebase session
        try {
            await signInAnonymously(auth);
            return;
        } catch (e: any) {
            console.error('AuthContext: Anonymous sign-in failed:', e);
        }
    };

    const fetchProfile = async (uid: string) => {
        try {
            const data = await dataService.getUserProfile(uid);
            if (data) {
                setProfile(data);
                return data;
            } else {
                const newProfile = {
                    role: ROLES.PLAYER,
                    email: auth.currentUser?.email || '',
                    name: auth.currentUser?.displayName || 'Usuario',
                    createdAt: new Date().toISOString()
                };
                await dataService.setUserProfile(uid, newProfile);
                setProfile(newProfile);
                return newProfile;
            }
        } catch (error) {
            console.error("AuthContext: Error fetching user profile:", error);
            setProfile((prev: any) => prev || { role: ROLES.PLAYER, name: 'Usuario (Offline)' });
        }
    };

    useEffect(() => {
        const el = document.getElementById('root-loading');
        if (el) el.style.setProperty('display', 'none');
        (window as any).enableDevMode = enableDevMode;

        const safetyTimeout = setTimeout(() => {
            setLoading((prev: boolean) => {
                if (prev) {
                    console.warn("AuthContext: Safety timeout reached.");
                    return false;
                }
                return prev;
            });
        }, 3000); // Increased timeout for slower connections

        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(safetyTimeout);
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                try {
                    const profileData = await dataService.getUserProfile(firebaseUser.uid);
                    if (profileData) {
                        setProfile(profileData);
                    } else {
                        const currentProfile = {
                            role: ROLES.PLAYER,
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || 'Usuario',
                            createdAt: new Date().toISOString()
                        };
                        await dataService.setUserProfile(firebaseUser.uid, currentProfile);
                        setProfile(currentProfile);
                    }
                } catch (error) {
                    console.error("AuthContext: Error fetching profile:", error);
                }
            } else {
                setProfile(null);
            }
        }, (error) => {
            console.error("AuthContext: Firebase Auth observer error:", error);
            clearTimeout(safetyTimeout);
            setLoading(false);
        });

        return () => {
            unsub();
            clearTimeout(safetyTimeout);
        };
    }, []);

    const signInWithGoogle = async () => {
        const res = await signInWithPopup(auth, googleProvider);
        if (res.user) {
            await fetchProfile(res.user.uid);
        }
    };

    const signInWithEmail = async (email: string, pass: string) => {
        const res = await signInWithEmailAndPassword(auth, email, pass);
        if (res.user) {
            await fetchProfile(res.user.uid);
        }
    };

    const signUpWithEmail = async (email: string, pass: string, name: string) => {
        const res = await createUserWithEmailAndPassword(auth, email, pass);
        if (res.user) {
            await updateProfile(res.user, { displayName: name });
            const newProfile = {
                role: ROLES.PLAYER,
                email: email,
                name: name,
                createdAt: new Date().toISOString()
            };
            await dataService.setUserProfile(res.user.uid, newProfile);
            setProfile(newProfile);
        }
    };

    const forgotPassword = async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    };

    const logout = async () => {
        await signOut(auth);
        setProfile(null);
    };

    const isAdmin = profile?.role === ROLES.ADMIN;
    const isPlayer = profile?.role === ROLES.PLAYER;
    const isMarker = profile?.role === ROLES.MARKER;
    /** Canchas asignadas al marcador por el admin (solo aplica si role === marker) */
    const markerCanchas: string[] = isMarker && Array.isArray(profile?.markerCanchas) ? profile.markerCanchas : [];
    const canMarkInCancha = (canchaId: string) => isAdmin || (isMarker && markerCanchas.includes(canchaId));
    const refreshProfile = async () => { if (user?.uid) await fetchProfile(user.uid); };

    return (
        <AuthContext.Provider value={{
            user,
            profile,
            loading,
            signInWithGoogle,
            signInWithEmail,
            signUpWithEmail,
            forgotPassword,
            enableDevMode,
            logout,
            isAdmin,
            isPlayer,
            isMarker,
            markerCanchas,
            canMarkInCancha,
            refreshProfile,
        }}>
            {loading ? (
                <div
                    className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-2xl animate-pulse"
                    style={{ minHeight: '100dvh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccff00', fontWeight: 900 }}
                >
                    <span>Padel</span>
                    <span style={{ color: '#fff', marginLeft: 8 }}>Smart</span>
                    <div style={{ marginLeft: 16, width: 16, height: 16, borderRadius: '50%', background: '#ccff00' }} />
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
