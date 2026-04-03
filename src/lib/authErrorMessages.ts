const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'invalid_credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'Signup disabled': 'El registro de nuevos usuarios está temporalmente deshabilitado.',
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
};

/** Token de refresco inválido o ausente (sesión caducada, revocada o datos locales corruptos). */
export function isInvalidRefreshTokenError(err: unknown): boolean {
  if (!err) return false;
  const code = typeof (err as { code?: string })?.code === 'string' ? String((err as { code?: string }).code) : '';
  const msg = err instanceof Error ? err.message : String(err);
  const lower = `${code} ${msg}`.toLowerCase();
  return (
    code === 'refresh_token_not_found' ||
    lower.includes('invalid refresh token') ||
    lower.includes('refresh token not found') ||
    lower.includes('refresh_token_not_found')
  );
}

/** Borra claves `sb-*` de Supabase Auth en el navegador (local + session). */
export function clearSupabaseBrowserStorage(): void {
  if (typeof window === 'undefined') return;
  const strip = (store: Storage) => {
    try {
      Object.keys(store).forEach((k) => {
        if (k.startsWith('sb-')) store.removeItem(k);
      });
    } catch {
      /* ignore */
    }
  };
  strip(localStorage);
  strip(sessionStorage);
}

export function getAuthErrorMessage(err: any): string {
  if (!err) return 'Ocurrió un error inesperado (no payload).';

  if (isInvalidRefreshTokenError(err)) {
    return 'Sesión expirada o no válida. Vuelve a iniciar sesión.';
  }

  const msg: string = err?.message || err?.error_description || err?.msg || (typeof err === 'string' ? err : JSON.stringify(err));
  const domName: string = typeof err?.name === 'string' ? err.name : '';
  const combinedLower = `${domName} ${msg}`.toLowerCase();

  // WebAuthn / Passkeys (DOMException y mensajes de Supabase)
  if (
    combinedLower.includes('notallowederror') ||
    combinedLower.includes('not allowed') ||
    combinedLower.includes('cancelled') ||
    combinedLower.includes('canceled') ||
    combinedLower.includes('aborted') ||
    combinedLower.includes('user cancelled') ||
    combinedLower.includes('user canceled')
  ) {
    return 'Autenticación cancelada.';
  }
  if (combinedLower.includes('excludecredentials')) {
    return 'Este dispositivo ya está registrado';
  }

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_credentials')) {
    return ERROR_MESSAGES['Invalid login credentials'];
  }
  if (msg.toLowerCase().includes('email not confirmed')) {
    return ERROR_MESSAGES['Email not confirmed'];
  }
  if (msg.toLowerCase().includes('already registered') || msg.toLowerCase().includes('email-already-in-use')) {
    return ERROR_MESSAGES['User already registered'];
  }
  if (msg.toLowerCase().includes('at least 6 characters')) {
    return ERROR_MESSAGES['Password should be at least 6 characters'];
  }

  if (process.env.NODE_ENV === 'development') {
    return `Error de autenticación: ${msg}`;
  }
  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}
