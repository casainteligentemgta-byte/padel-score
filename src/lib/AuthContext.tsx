'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { dataService, ROLES } from '@/lib/dataService';
import type { AppUser } from '@/lib/types/auth';

interface AuthContextType {
    user: AppUser | null;
    profile: any | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, pass: string) => Promise<void>;
    signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    enableDevMode: () => void | Promise<void>;
    logout: () => Promise<void>;
    isAdmin: boolean;
    isPlayer: boolean;
    isMarker: boolean;
    markerCanchas: string[];
    canMarkInCancha: (canchaId: string) => boolean;
    refreshProfile: () => Promise<void>;
}

function mapSupabaseUser(su: { id: string; email?: string; user_metadata?: Record<string, unknown> } | null): AppUser | null {
    if (!su) return null;
    const meta = su.user_metadata || {};
    return {
        uid: su.id,
        id: su.id,
        email: su.email ?? null,
        displayName: (meta.full_name as string) || (meta.name as string) || su.email || null,
        photoURL: (meta.avatar_url as string) || (meta.picture as string) || null,
    };
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
    const [user, setUser] = useState<AppUser | null>(null);
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const supabase = getSupabaseClient();

    const fetchProfile = async (uid: string, opts?: { email?: string; name?: string }) => {
        try {
            const data = await dataService.getUserProfile(uid);
            if (data) {
                setProfile(data);
                return data;
            }
            const newProfile = {
                role: ROLES.PLAYER,
                email: opts?.email ?? '',
                name: opts?.name ?? 'Usuario',
                createdAt: new Date().toISOString(),
            };
            await dataService.setUserProfile(uid, newProfile);
            setProfile(newProfile);
            return newProfile;
        } catch (error) {
            console.error('AuthContext: Error fetching user profile:', error);
            setProfile((prev: any) => prev || { role: ROLES.PLAYER, name: 'Usuario (Offline)' });
        }
    };

    useEffect(() => {
        const el = document.getElementById('root-loading');
        if (el) el.style.setProperty('display', 'none');

        if (!supabase) {
            setLoading(false);
            return;
        }

        (window as any).enableDevMode = enableDevMode;

        const safetyTimeout = setTimeout(() => setLoading(false), 3000);

        let subscription: { unsubscribe: () => void } | null = null;
        try {
            const { data: { subscription: sub } } = supabase.auth.onAuthStateChange(async (event, session) => {
                const appUser = session?.user ? mapSupabaseUser(session.user) : null;
                setUser(appUser);
                setLoading(false);
                clearTimeout(safetyTimeout);

                if (appUser) {
                    fetchProfile(appUser.uid, {
                        email: appUser.email ?? undefined,
                        name: appUser.displayName ?? undefined,
                    }).catch(err => console.error('AuthContext: Profile fetch error', err));
                } else {
                    setProfile(null);
                }
            });
            subscription = sub;
        } catch (e) {
            console.error('AuthContext: onAuthStateChange failed', e);
            setLoading(false);
        }

        supabase.auth.getSession()
            .then(async ({ data: { session } }) => {
                const appUser = session?.user ? mapSupabaseUser(session.user) : null;
                setUser(appUser);
                setLoading(false); // Immediate resolution
                if (appUser) {
                    fetchProfile(appUser.uid, { // Non-blocking
                        email: appUser.email ?? undefined,
                        name: appUser.displayName ?? undefined,
                    }).catch(() => setProfile({ role: ROLES.PLAYER, name: 'Usuario' }));
                }
                clearTimeout(safetyTimeout);
            })
            .catch((e) => {
                console.error('AuthContext: getSession failed', e);
                setLoading(false);
                clearTimeout(safetyTimeout);
            });

        return () => {
            subscription?.unsubscribe();
            clearTimeout(safetyTimeout);
        };
    }, [supabase]);

    const enableDevMode = async () => {
        if (!supabase) {
            console.warn('AuthContext: enableDevMode ignorado (Supabase no configurado).');
            return;
        }
        const devEmail = process.env.NEXT_PUBLIC_DEV_EMAIL?.trim();
        const devPassword = process.env.NEXT_PUBLIC_DEV_PASSWORD?.trim();
        if (devEmail && devPassword) {
            try {
                await supabase.auth.signInWithPassword({ email: devEmail, password: devPassword });
                return;
            } catch (e) {
                console.warn('AuthContext: Simulación falló:', e);
            }
        }
    };

    const signInWithGoogle = async () => {
        if (!supabase) throw new Error('Supabase no está configurado. Revisa .env.local (NEXT_PUBLIC_SUPABASE_*).');
        const origin = typeof window !== 'undefined' ? window.location.origin : '';
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: origin ? `${origin}/` : undefined },
        });
    };

    const signInWithEmail = async (email: string, pass: string) => {
        if (!supabase) throw new Error('Supabase no está configurado. Revisa .env.local (NEXT_PUBLIC_SUPABASE_*).');
        const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
        if (error) throw error;
        if (data.user) await fetchProfile(data.user.id, { email: data.user.email ?? undefined, name: (data.user.user_metadata?.full_name as string) || (data.user.user_metadata?.name as string) });
    };

    const signUpWithEmail = async (email: string, pass: string, name: string) => {
        if (!supabase) throw new Error('Supabase no está configurado. Revisa .env.local (NEXT_PUBLIC_SUPABASE_*).');
        const { data, error } = await supabase.auth.signUp({
            email,
            password: pass,
            options: { data: { full_name: name, name } },
        });
        if (error) throw error;
        if (data.user) {
            const newProfile = {
                role: ROLES.PLAYER,
                email,
                name,
                createdAt: new Date().toISOString(),
            };
            await dataService.setUserProfile(data.user.id, newProfile);
            setProfile(newProfile);
        }
    };

    const forgotPassword = async (email: string) => {
        if (!supabase) throw new Error('Supabase no está configurado. Revisa .env.local (NEXT_PUBLIC_SUPABASE_*).');
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/login`,
        });
        if (error) throw error;
    };

    const logout = async () => {
        if (supabase) await supabase.auth.signOut();
        setProfile(null);
    };

    const isAdmin = profile?.role === ROLES.ADMIN;
    const isPlayer = profile?.role === ROLES.PLAYER;
    const isMarker = profile?.role === ROLES.MARKER;
    const markerCanchas: string[] = isMarker && Array.isArray(profile?.markerCanchas) ? profile.markerCanchas : [];
    const canMarkInCancha = (canchaId: string) => isAdmin || (isMarker && markerCanchas.includes(canchaId));
    const refreshProfile = async () => {
        if (user?.uid) await fetchProfile(user.uid);
    };

    return (
        <AuthContext.Provider
            value={{
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
            }}
        >
            {loading ? (
                <div
                    className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-2xl animate-pulse"
                    style={{
                        minHeight: '100dvh',
                        background: '#0a0a0a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ccff00',
                        fontWeight: 900,
                    }}
                >
                    <span>Padel</span>
                    <span style={{ color: '#fff', marginLeft: 8 }}>Smart</span>
                    <div style={{ marginLeft: 16, width: 16, height: 16, borderRadius: '50%', background: '#ccff00' }} />
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
