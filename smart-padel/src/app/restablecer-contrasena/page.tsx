'use client';

import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RestablecerContrasenaPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmar, setConfirmar] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    if (password !== confirmar) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    setCargando(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.updateUser({ password });
    setCargando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setOk(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <p className="text-zinc-600">Cargando…</p>
      </div>
    );
  }

  if (!user) return null;

  if (ok) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-100 px-4">
        <h1 className="text-xl font-semibold text-zinc-900">Contraseña actualizada</h1>
        <p className="text-center text-zinc-600">
          Ya puedes iniciar sesión con tu nueva contraseña.
        </p>
        <Link
          href="/perfil"
          className="rounded-xl bg-zinc-900 px-6 py-3 font-medium text-white hover:bg-zinc-800"
        >
          Ir a mi perfil
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-100 px-4">
      <h1 className="text-xl font-semibold text-zinc-900">Nueva contraseña</h1>
      <p className="max-w-sm text-center text-zinc-600">
        Elige una contraseña segura (mínimo 6 caracteres).
      </p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Nueva contraseña"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400"
          autoComplete="new-password"
          minLength={6}
        />
        <input
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="Confirmar contraseña"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400"
          autoComplete="new-password"
          minLength={6}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {cargando ? 'Guardando…' : 'Guardar contraseña'}
        </button>
      </form>
      <Link
        href="/perfil"
        className="text-sm text-zinc-500 underline hover:text-zinc-700"
      >
        Volver al perfil
      </Link>
    </div>
  );
}
