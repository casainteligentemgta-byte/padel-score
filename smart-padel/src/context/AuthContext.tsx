'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/profile';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  /** Loggeo rápido con Google (un clic). */
  signInWithGoogle: () => Promise<void>;
  /** Loggeo clásico con email + contraseña. */
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  /** Registro con email + contraseña (no Google). */
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => ({ error: null }),
  signUpWithEmail: async () => ({ error: null }),
  logout: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    setProfile(data as Profile | null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const upsertProfileFromUser = async (user: User) => {
    // Fecha de nacimiento: Google no la envía por defecto; si está en user_metadata la usamos
    const raw = user.user_metadata as Record<string, unknown> | undefined;
    let birth_date: string | null = null;
    if (raw?.birthdate) {
      birth_date = typeof raw.birthdate === 'string' ? raw.birthdate : null;
    } else if (raw?.birth_date) {
      birth_date = typeof raw.birth_date === 'string' ? raw.birth_date : null;
    }
    const full_name = (raw?.full_name ?? raw?.name ?? user.email?.split('@')[0] ?? null) as string | null;

    const { data: existing } = await supabase.from('profiles').select('id, birth_date').eq('id', user.id).single();
    const payload: Record<string, unknown> = {
      id: user.id,
      full_name: full_name ?? undefined,
      skill_level: 1.0,
      updated_at: new Date().toISOString(),
    };
    // Solo escribir birth_date si viene de Google o si no hay perfil (evitar pisar el que editó el usuario)
    if (birth_date) payload.birth_date = birth_date;
    else if (!existing) payload.birth_date = null;

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
    if (error) console.error('Error upserting profile:', error);
    await fetchProfile(user.id);
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
          await upsertProfileFromUser(session.user);
        } else {
          await fetchProfile(session.user.id);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      console.error('Error al iniciar con Google (Supabase):', error);
      alert(
        'No se pudo iniciar sesión con Google.\n\n' +
          'Comprueba en Supabase → Authentication → Providers que Google esté activado y que este dominio (localhost o tu dominio de producción) esté permitido.'
      );
    }
  };

  const signInWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async (
    email: string,
    password: string
  ): Promise<{ error: string | null }> => {
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    return { error: error?.message ?? null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
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
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
