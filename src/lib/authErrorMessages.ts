const ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email o contraseña incorrectos.',
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  email_not_confirmed: 'Confirma tu correo antes de iniciar sesión.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  signup_disabled: 'El registro de nuevos usuarios está temporalmente deshabilitado.',
  user_already_registered: 'Este email ya está registrado.',
  weak_password: 'La contraseña no cumple los requisitos de seguridad.',
  over_request_rate_limit: 'Demasiados intentos. Espera un momento e inténtalo de nuevo.',
  request_timeout: 'Supabase tardó demasiado en responder. Reintenta.',
};

function isVerboseAuthErrors(): boolean {
  if (process.env.NODE_ENV === 'development') return true;
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || '').toLowerCase();
  if (appUrl.includes('mgti') || appUrl.includes('staging') || appUrl.includes('localhost')) {
    return true;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase();
    if (host === 'localhost' || host.includes('mgti') || host.includes('staging')) return true;
    if (host.endsWith('.vercel.app') && !host.includes('smartpadel58')) return true;
  }
  return false;
}

function pickString(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return '';
}

export function extractAuthError(err: unknown): {
  message: string;
  code?: string;
  status?: number;
} {
  if (!err) return { message: 'sin detalle' };
  if (typeof err === 'string') return { message: err };

  const e = err as Record<string, unknown>;
  const nested = (e.error && typeof e.error === 'object' ? (e.error as Record<string, unknown>) : null);
  const code = pickString(e.code, nested?.code) || undefined;
  const status =
    typeof e.status === 'number'
      ? e.status
      : typeof nested?.status === 'number'
        ? (nested.status as number)
        : undefined;

  const message =
    pickString(
      e.message,
      e.error_description,
      e.msg,
      nested?.message,
      typeof e.error === 'string' ? e.error : undefined,
      code,
    ) || safeStringify(err);

  return { message, code, status };
}

function safeStringify(err: unknown): string {
  try {
    const text = JSON.stringify(err);
    return text && text !== '{}' ? text : 'Error desconocido';
  } catch {
    return 'Error desconocido';
  }
}

function mapKnownAuthError(message: string, code?: string, status?: number): string | null {
  const lower = `${code || ''} ${message}`.toLowerCase();

  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];
  for (const [key, label] of Object.entries(ERROR_MESSAGES)) {
    if (lower.includes(key.toLowerCase())) return label;
  }

  if (lower.includes('invalid login credentials') || lower.includes('invalid_credentials')) {
    return ERROR_MESSAGES.invalid_credentials;
  }
  if (lower.includes('email not confirmed')) return ERROR_MESSAGES.email_not_confirmed;
  if (lower.includes('already registered') || lower.includes('email-already-in-use')) {
    return ERROR_MESSAGES.user_already_registered;
  }
  if (lower.includes('at least 6 characters')) {
    return 'La contraseña debe tener al menos 6 caracteres.';
  }
  if (
    lower.includes('failed to fetch') ||
    lower.includes('networkerror') ||
    lower.includes('load failed') ||
    lower.includes('network request failed')
  ) {
    return 'No hay conexión con Supabase. Revisa bloqueador, red o variables NEXT_PUBLIC_SUPABASE_* en Vercel.';
  }
  if (lower.includes('invalid api key') || lower.includes('apikey') || status === 401) {
    return 'Clave anon de Supabase incorrecta o ausente en este despliegue.';
  }
  if (lower.includes('supabase no está configurado') || lower.includes('error config')) {
    return message;
  }

  return null;
}

/** Token de refresco inválido o ausente (sesión caducada, revocada o datos locales corruptos). */
export function isInvalidRefreshTokenError(err: unknown): boolean {
  if (!err) return false;
  const { message, code } = extractAuthError(err);
  const lower = `${code || ''} ${message}`.toLowerCase();
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

export function getAuthErrorMessage(err: unknown): string {
  if (!err) return 'Ocurrió un error inesperado (sin detalle).';

  if (isInvalidRefreshTokenError(err)) {
    return 'Sesión expirada o no válida. Vuelve a iniciar sesión.';
  }

  const { message, code, status } = extractAuthError(err);
  const domName = typeof (err as { name?: string })?.name === 'string' ? String((err as { name?: string }).name) : '';
  const combinedLower = `${domName} ${code || ''} ${message}`.toLowerCase();

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

  const mapped = mapKnownAuthError(message, code, status);
  if (mapped) return mapped;

  if (isVerboseAuthErrors()) {
    const parts = [message];
    if (code && !message.toLowerCase().includes(code.toLowerCase())) parts.push(`código: ${code}`);
    if (status) parts.push(`HTTP ${status}`);
    return parts.join(' · ');
  }

  return 'No se pudo completar la operación. Inténtalo de nuevo.';
}

export function shouldShowVerboseAuthErrors(): boolean {
  return isVerboseAuthErrors();
}
