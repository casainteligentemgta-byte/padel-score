const ERROR_MESSAGES: Record<string, string> = {
  'auth/operation-not-allowed':
    'El método de inicio de sesión no está habilitado. Actívalo en Firebase → Authentication → Sign-in method.',
  'auth/configuration-not-found':
    'El servicio de Autenticación no está activado. Revísalo en Firebase Console → Authentication.',
  'auth/user-not-found':
  'auth/wrong-password':
  'auth/invalid-credential':
    'Credenciales incorrectas (Email o contraseña).',
  'auth/email-already-in-use': 'Este email ya está registrado.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/unauthorized-domain':
    'Este dominio no está autorizado. Añádelo en Firebase → Authentication → Settings → Authorized domains.',
  'auth/invalid-api-key':
    'Configuración de Firebase incorrecta (API Key). Revisa las variables NEXT_PUBLIC_FIREBASE_*.',
  'auth/network-request-failed':
    'Error de red. Comprueba tu conexión e intenta de nuevo.',
};

export function getFirebaseErrorMessage(err: any): string {
  const code: string | undefined = err?.code ?? err?.error?.code;
  const msg: string | undefined =
    err?.message ??
    err?.error?.message ??
    (typeof err === 'string' ? err : undefined) ??
    err?.toString?.();

  if (code && ERROR_MESSAGES[code]) return ERROR_MESSAGES[code];

  if (msg && msg.toLowerCase().includes('network')) {
    return 'Error de red. Comprueba tu conexión e intenta de nuevo.';
  }
  if (msg && msg.toLowerCase().includes('api key')) {
    return 'Configuración de Firebase incorrecta (API Key). Revisa las variables NEXT_PUBLIC_FIREBASE_* en tu entorno.';
  }

  return `Error en la autenticación: ${msg || code || 'desconocido'}.`;
}

