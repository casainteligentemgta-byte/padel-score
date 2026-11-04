export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

/** Login de cuentas existentes (pueden ser anteriores a la regla de registro). */
export const isValidPassword = (password: string): boolean =>
  typeof password === 'string' && password.length >= 6;

export type SignupPasswordRequirement = {
  label: string;
  test: (password: string) => boolean;
};

/** Una sola regla de registro: 8-16, mayúscula, minúscula, número y especial. */
export const SIGNUP_PASSWORD_REQUIREMENTS: SignupPasswordRequirement[] = [
  { label: '8-16 caracteres', test: (p) => p.length >= 8 && p.length <= 16 },
  { label: 'Mayúscula y minúscula', test: (p) => /[a-z]/.test(p) && /[A-Z]/.test(p) },
  { label: 'Un número (0-9)', test: (p) => /[0-9]/.test(p) },
  { label: 'Carácter especial', test: (p) => /[^a-zA-Z0-9]/.test(p) },
];

export const validateSignupPassword = (password: string): { valid: boolean; error?: string } => {
  if (password.length < 8 || password.length > 16) {
    return { valid: false, error: 'Debe tener entre 8 y 16 caracteres' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: 'Debe contener al menos una letra minúscula' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: 'Debe contener al menos una letra mayúscula' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: 'Debe contener al menos un número' };
  }
  if (!/[^a-zA-Z0-9]/.test(password)) {
    return { valid: false, error: 'Debe contener al menos un carácter especial (ej. - _ @ # $)' };
  }
  return { valid: true };
};
