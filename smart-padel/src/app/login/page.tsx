'use client';

import { useAuth } from '@/context/AuthContext';
import BouncingBall from '@/components/BouncingBall';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const { user, loading, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [cargandoRegistro, setCargandoRegistro] = useState(false);

  useEffect(() => {
    if (!loading && user) router.replace('/perfil');
  }, [user, loading, router]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Escribe tu correo y contraseña.');
      return;
    }
    setCargando(true);
    const { error } = await signInWithEmail(email, password);
    setCargando(false);
    if (error) {
      setError(error);
    }
  };

  const handleEmailRegister = async () => {
    setError(null);
    if (!email.trim() || !password) {
      setError('Escribe tu correo y una contraseña para registrarte.');
      return;
    }
    setCargandoRegistro(true);
    const { error } = await signUpWithEmail(email, password);
    setCargandoRegistro(false);
    if (error) {
      setError(error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-zinc-300">Cargando…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-black px-4 py-8 text-white">
      <div className="flex w-full max-w-3xl flex-col items-center gap-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col items-center gap-4 md:items-start">
          <div className="flex items-center gap-4">
            <BouncingBall size={42} />
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">
              SMART <span className="text-[#ccff00]">PADEL</span>
            </h1>
          </div>
        </div>

        <div className="w-full max-w-sm space-y-5 rounded-2xl bg-zinc-900/60 p-6 shadow-lg shadow-black/40">
          {/* Loggeo rápido: Google (un clic) */}
          <button
            type="button"
            onClick={signInWithGoogle}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-white/5 px-6 py-3 text-sm font-medium text-white border border-white/15 transition hover:bg-white/10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 text-xs text-zinc-500">
            <div className="h-px flex-1 bg-zinc-700" />
            <span>Inicio de sesión</span>
            <div className="h-px flex-1 bg-zinc-700" />
          </div>

          {/* Loggeo clásico: email + contraseña */}
          <form onSubmit={handleEmailLogin} className="space-y-3">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo electrónico"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:outline-none"
                autoComplete="email"
              />
            </div>
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full rounded-xl border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:border-zinc-300 focus:outline-none"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={cargando}
              className="w-full rounded-xl bg-[#ccff00] px-4 py-3 text-sm font-black uppercase italic text-black transition hover:brightness-110 disabled:opacity-50"
            >
              {cargando ? 'Entrando…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 text-xs">
            <button
              type="button"
              disabled={cargandoRegistro}
              onClick={handleEmailRegister}
              className="text-zinc-200 hover:text-white disabled:opacity-60"
            >
              {cargandoRegistro ? 'Creando cuenta…' : 'Crear cuenta nueva'}
            </button>
            <Link href="/login/recuperar" className="text-zinc-400 hover:text-zinc-200">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
