export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export const isValidPassword = (password: string): boolean =>
  typeof password === 'string' && password.length >= 6;

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
    return { valid: false, error: 'Debe contener al menos un carácter especial' };
  }
  return { valid: true };
};
