'use client';

import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useState } from 'react';

export default function RecuperarPage() {
  const [email, setEmail] = useState('');
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim()) {
      setError('Escribe tu correo.');
      return;
    }
    setCargando(true);
    const supabase = createClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/restablecer-contrasena`,
    });
    setCargando(false);
    if (err) {
      setError(err.message);
      return;
    }
    setEnviado(true);
  };

  if (enviado) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-100 px-4">
        <h1 className="text-xl font-semibold text-zinc-900">Revisa tu correo</h1>
        <p className="max-w-sm text-center text-zinc-600">
          Si existe una cuenta con <strong>{email}</strong>, te hemos enviado un enlace para restablecer la contraseña.
        </p>
        <Link
          href="/login"
          className="text-sm text-zinc-600 underline hover:text-zinc-900"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-zinc-100 px-4">
      <h1 className="text-xl font-semibold text-zinc-900">Recuperar contraseña</h1>
      <p className="max-w-sm text-center text-zinc-600">
        Escribe el correo de tu cuenta y te enviaremos un enlace para crear una nueva contraseña.
      </p>
      <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Correo electrónico"
          className="rounded-xl border border-zinc-300 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400"
          autoComplete="email"
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={cargando}
          className="rounded-xl bg-zinc-900 px-4 py-3 font-medium text-white transition hover:bg-zinc-800 disabled:opacity-50"
        >
          {cargando ? 'Enviando…' : 'Enviar enlace'}
        </button>
      </form>
      <Link
        href="/login"
        className="text-sm text-zinc-500 underline hover:text-zinc-700"
      >
        Volver al inicio de sesión
      </Link>
    </div>
  );
}
