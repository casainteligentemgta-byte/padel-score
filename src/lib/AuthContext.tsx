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

    // MODO DESARROLLADOR: Simulación con sesión real para poder guardar torneos en Firestore
    const enableDevMode = async () => {
        const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL?.trim();
        const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD?.trim();
        if (devEmail && devPassword) {
            try {
                await signInWithEmailAndPassword(auth, devEmail, devPassword);
                // onAuthStateChanged se disparará y cargará user + profile real; podrás guardar torneos
                return;
            } catch (e) {
                console.warn('AuthContext: Simulación con credenciales reales falló, usando usuario mock (no se podrá guardar):', e);
            }
        }
        // Fallback: anonymous login to have a real Firebase session
        try {
            await signInAnonymously(auth);
            // After signing in, we can still set the mock profile as admin for UI purposes
            setProfile({ role: ROLES.ADMIN, name: 'Luis Mata (Mock Admin)' });
            return;
        } catch (e: any) {
            const code = e?.code || e?.message || '';
            if (code.includes('admin-restricted-operation') || code.includes('auth/admin-restricted-operation')) {
                console.warn(
                    'AuthContext: La autenticación anónima no está permitida en este proyecto. ' +
                    'Para habilitarla: Firebase Console → Authentication → Sign-in method → Anonymous → Activar. ' +
                    'Usando usuario mock para desarrollo.'
                );
            } else {
                console.error('AuthContext: Anonymous sign-in failed:', e);
            }
        }

        // Ultimate fallback: mock user only (Firestore will fail if rules require auth)
        const mockUser = {
            uid: 'CMWhNg0MYIgiczQGkGGLl1tKn6A2',
            displayName: 'Luis Mata (Owner)',
            email: 'casainteligentemgta@gmail.com',
            photoURL: 'https://ui-avatars.com/api/?name=Luis+Mata&background=C1FF00&color=000'
        } as User;
        setUser(mockUser);
        setProfile({ role: ROLES.ADMIN, name: 'Luis Mata' });
        setLoading(false);
    };

    const fetchProfile = async (uid: string) => {
        try {
            console.log("AuthContext: Fetching profile for", uid);
            const data = await dataService.getUserProfile(uid);
            if (data) {
                setProfile(data);
                return data;
            } else {
                // Si no existe perfil, lo creamos por defecto como jugador
                console.log("AuthContext: Profile not found, creating default");
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
            // Non-blocking fallback
            setProfile((prev: any) => prev || { role: ROLES.PLAYER, name: 'Usuario (Offline)' });
        }
    };

    useEffect(() => {
        const el = document.getElementById('root-loading');
        if (el) el.style.setProperty('display', 'none');
        (window as any).enableDevMode = enableDevMode;

        // Safety timeout para que la página se vea en local aunque Firebase tarde
        const safetyTimeout = setTimeout(() => {
            setLoading((prev: boolean) => {
                if (prev) {
                    console.warn("AuthContext: Safety timeout reached. Forcing load (fallback).");
                    return false;
                }
                return prev;
            });
        }, 1200);

        const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
            console.log("AuthContext: onAuthStateChanged", firebaseUser?.email || "No user");
            clearTimeout(safetyTimeout);
            setUser(firebaseUser);
            // Non-blocking for initial load
            setLoading(false);

            if (firebaseUser) {
                try {
                    console.log("AuthContext: Fetching profile for", firebaseUser.uid);
                    const profileData = await dataService.getUserProfile(firebaseUser.uid);
                    let currentProfile = profileData;

                    if (!profileData) {
                        currentProfile = {
                            role: ROLES.PLAYER,
                            email: firebaseUser.email || '',
                            name: firebaseUser.displayName || 'Usuario',
                            createdAt: new Date().toISOString()
                        };
                        await dataService.setUserProfile(firebaseUser.uid, currentProfile);
                    }

                    // Check for hardcoded Admin
                    if (firebaseUser.email === 'casainteligentemgta@gmail.com' && currentProfile && currentProfile.role !== ROLES.ADMIN) {
                        currentProfile.role = ROLES.ADMIN;
                        await dataService.setUserProfile(firebaseUser.uid, currentProfile);
                    }

                    setProfile(currentProfile);
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
            const isAbsoluteAdmin = email === 'casainteligentemgta@gmail.com';
            const newProfile = {
                role: isAbsoluteAdmin ? ROLES.ADMIN : ROLES.PLAYER,
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

    const isAdmin = profile?.role === ROLES.ADMIN || user?.email === 'casainteligentemgta@gmail.com';
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
