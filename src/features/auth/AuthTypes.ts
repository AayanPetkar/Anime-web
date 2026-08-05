// Shared types for the authentication feature.

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isAnonymous: boolean;
}

export type AuthErrorCode =
  | 'invalid-email'
  | 'user-disabled'
  | 'user-not-found'
  | 'wrong-password'
  | 'email-already-in-use'
  | 'weak-password'
  | 'popup-closed'
  | 'network-error'
  | 'unknown';

export class AuthError extends Error {
  code: AuthErrorCode;
  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.code = code;
    this.name = 'AuthError';
  }
}

export interface SignUpInput {
  username: string;
  email: string;
  password: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
