'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
    onAuthStateChanged,
    User,
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    updateProfile
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
            uid: 'dev-user-123',
            displayName: 'Simulated Admin',
            email: 'dev@padelscore.pro',
            photoURL: 'https://ui-avatars.com/api/?name=Simulated+Admin&background=C1FF00&color=000'
        } as User;
        setUser(mockUser);
        setProfile({ role: ROLES.ADMIN, name: 'Simulated Admin' });
        setLoading(false);
    };

    const fetchProfile = async (uid: string) => {
        try {
            const data = await dataService.getUserProfile(uid);
            if (data) {
                setProfile(data);
            } else {
                // Si no existe perfil, lo creamos por defecto como jugador
                const newProfile = {
                    role: ROLES.PLAYER,
                    email: auth.currentUser?.email || '',
                    name: auth.currentUser?.displayName || 'Usuario',
                    createdAt: new Date().toISOString()
                };
                await dataService.setUserProfile(uid, newProfile);
                setProfile(newProfile);
            }
        } catch (error) {
            console.error("Error fetching user profile:", error);
        }
    };

    useEffect(() => {
        (window as any).enableDevMode = enableDevMode;

        let unsub = () => { };
        try {
            unsub = onAuthStateChanged(auth, async (firebaseUser) => {
                setUser(firebaseUser);
                if (firebaseUser) {
                    await fetchProfile(firebaseUser.uid);
                    // Asegurar que casainteligentemgta@gmail.com sea ADMIN si se loguea
                    if (firebaseUser.email === 'casainteligentemgta@gmail.com' && profile?.role !== ROLES.ADMIN) {
                        const updatedProfile = { ...profile, role: ROLES.ADMIN };
                        await dataService.setUserProfile(firebaseUser.uid, updatedProfile);
                        setProfile(updatedProfile);
                    }
                } else {
                    setProfile(null);
                }
                setLoading(false);
            }, (error) => {
                console.error("Firebase Auth observer error:", error);
                setLoading(false);
            });
        } catch (e) {
            console.error("Failed to initialize Firebase Auth listener:", e);
            setLoading(false);
        }

        return () => unsub();
    }, [profile?.role]); // Added profile?.role to dependencies to react to role changes

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
