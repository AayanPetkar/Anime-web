// Pure validation helpers shared by the signup/login/settings forms.

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): ValidationResult {
  if (!email.trim()) return { valid: false, message: 'Email is required.' };
  if (!EMAIL_PATTERN.test(email)) return { valid: false, message: 'Enter a valid email address.' };
  return { valid: true };
}

/** Strong password: 8+ chars, at least one letter and one number. */
export function validatePassword(password: string): ValidationResult {
  if (!password) return { valid: false, message: 'Password is required.' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters.' };
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
    return { valid: false, message: 'Password must include a letter and a number.' };
  }
  return { valid: true };
}

export function validatePasswordConfirmation(password: string, confirmation: string): ValidationResult {
  if (password !== confirmation) return { valid: false, message: 'Passwords do not match.' };
  return { valid: true };
}

export function validateUsername(username: string): ValidationResult {
  const trimmed = username.trim();
  if (!trimmed) return { valid: false, message: 'Username is required.' };
  if (trimmed.length < 3) return { valid: false, message: 'Username must be at least 3 characters.' };
  if (trimmed.length > 24) return { valid: false, message: 'Username must be under 24 characters.' };
  if (!/^[a-zA-Z0-9_ ]+$/.test(trimmed)) {
    return { valid: false, message: 'Username can only contain letters, numbers, spaces, and underscores.' };
  }
  return { valid: true };
}

/** 0 (weak) - 4 (strong) — drives the password-strength meter on signup. */
export function passwordStrength(password: string): number {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  return Math.min(score, 4);
}
