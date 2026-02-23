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
    sendPasswordResetEmail
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
    enableDevMode: () => void;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isPlayer: boolean;
    isMarker: boolean;
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
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    // MODO DESARROLLADOR: Habilitar una sesión falsa para simulación si es necesario
    const enableDevMode = () => {
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
        (window as any).enableDevMode = enableDevMode;

        // Safety timeout to prevent permanent hang
        const safetyTimeout = setTimeout(() => {
            setLoading((prev: boolean) => {
                if (prev) {
                    console.warn("AuthContext: Safety timeout reached. Forcing load (fallback).");
                    return false;
                }
                return prev;
            });
        }, 5000);

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
            isMarker
        }}>
            {loading ? (
                <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[#ccff00] font-black italic uppercase tracking-tighter text-2xl animate-pulse">
                    Padel <span className="text-white ml-2">Smart</span>
                    <div className="ml-4 w-4 h-4 rounded-full bg-[#ccff00] animate-bounce" />
                </div>
            ) : children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
