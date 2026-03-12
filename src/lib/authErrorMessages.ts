const ERROR_MESSAGES: Record<string, string> = {
  'Invalid login credentials': 'Email o contraseña incorrectos.',
  'invalid_credentials': 'Email o contraseña incorrectos.',
  'Email not confirmed': 'Confirma tu correo antes de iniciar sesión.',
  'Signup disabled': 'El registro de nuevos usuarios está temporalmente deshabilitado.',
  'User already registered': 'Este email ya está registrado.',
  'Password should be at least 6 characters': 'La contraseña debe tener al menos 6 caracteres.',
};

export function getAuthErrorMessage(err: any): string {
  if (!err) return 'Ocurrió un error inesperado (no payload).';

  const msg: string = err?.message || err?.error_description || err?.msg || (typeof err === 'string' ? err : JSON.stringify(err));

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

  // To debug exactly what NEXT is reading/failing on:
  return `Raw Auth Error: ${msg}`;
}
