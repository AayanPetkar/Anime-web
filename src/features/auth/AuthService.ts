// Thin wrapper around the Firebase Auth SDK. Every method returns/throws
// our own AppUser/AuthError types so the rest of the app never touches the
// `firebase/auth` package directly — swapping auth providers later only
// means changing this file.
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  type User,
} from 'firebase/auth';
import { getFirebaseAuth, googleAuthProvider } from '@/lib/firebase';
import { AuthError, type AppUser, type AuthErrorCode, type SignInInput, type SignUpInput } from './AuthTypes';

function toAppUser(user: User): AppUser {
  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    isAnonymous: user.isAnonymous,
  };
}

const FIREBASE_ERROR_MAP: Record<string, AuthErrorCode> = {
  'auth/invalid-email': 'invalid-email',
  'auth/user-disabled': 'user-disabled',
  'auth/user-not-found': 'user-not-found',
  'auth/wrong-password': 'wrong-password',
  'auth/invalid-credential': 'wrong-password',
  'auth/email-already-in-use': 'email-already-in-use',
  'auth/weak-password': 'weak-password',
  'auth/popup-closed-by-user': 'popup-closed',
  'auth/network-request-failed': 'network-error',
};

const FRIENDLY_MESSAGE: Record<AuthErrorCode, string> = {
  'invalid-email': 'That email address looks invalid.',
  'user-disabled': 'This account has been disabled.',
  'user-not-found': 'No account found with that email.',
  'wrong-password': 'Incorrect email or password.',
  'email-already-in-use': 'An account with that email already exists.',
  'weak-password': 'Please choose a stronger password.',
  'popup-closed': 'Sign-in was cancelled.',
  'network-error': 'Network error — check your connection and try again.',
  unknown: 'Something went wrong. Please try again.',
};

function normalizeError(err: unknown): AuthError {
  const code = (err as { code?: string })?.code ?? '';
  const mapped = FIREBASE_ERROR_MAP[code] ?? 'unknown';
  return new AuthError(mapped, FRIENDLY_MESSAGE[mapped]);
}

export const AuthService = {
  /** Keeps the user signed in across refreshes/tabs (rememberMe=true), or
   * only for the current browser session (rememberMe=false). */
  async setPersistenceMode(rememberMe: boolean): Promise<void> {
    await setPersistence(
      getFirebaseAuth(),
      rememberMe ? browserLocalPersistence : browserSessionPersistence
    );
  },

  async signUpWithEmail({ username, email, password }: SignUpInput): Promise<AppUser> {
    try {
      const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
      await updateProfile(credential.user, { displayName: username });
      return toAppUser(credential.user);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async signInWithEmail({ email, password }: SignInInput): Promise<AppUser> {
    try {
      const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
      return toAppUser(credential.user);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async signInWithGoogle(): Promise<AppUser> {
    try {
      const credential = await signInWithPopup(getFirebaseAuth(), googleAuthProvider);
      return toAppUser(credential.user);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async sendPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), email);
    } catch (err) {
      throw normalizeError(err);
    }
  },

  async signOutUser(): Promise<void> {
    await signOut(getFirebaseAuth());
  },

  /** Subscribes to Firebase's auth-state stream; returns the unsubscribe fn. */
  onAuthChange(callback: (user: AppUser | null) => void): () => void {
    return onAuthStateChanged(getFirebaseAuth(), (user) => callback(user ? toAppUser(user) : null));
  },
};
