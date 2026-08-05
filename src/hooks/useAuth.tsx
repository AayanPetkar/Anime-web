'use client';

// Global auth context. Owns: the Firebase auth subscription, "guest mode"
// (a local-only flag — guests never touch Firebase Auth at all), loading the
// Firestore profile doc once signed in, switching the active ProgressStore
// backend (features/progress/StorageFactory), and surfacing the
// guest-progress merge prompt when a guest signs into a real account.
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { AuthService, type AppUser, type SignInInput, type SignUpInput } from '@/features/auth';
import { ProfileService, type UserProfileDoc } from '@/features/profile';
import {
  setStorageMode,
  hasLocalProgressToMerge,
  mergeGuestProgressIntoAccount,
  type MergeStrategy,
} from '@/features/progress';
import { isFirebaseConfigured } from '@/lib/firebase';

const GUEST_FLAG_KEY = 'asar:guestMode';

export type AuthStatus = 'loading' | 'signed-out' | 'guest' | 'signed-in';

interface AuthContextValue {
  status: AuthStatus;
  user: AppUser | null;
  profile: UserProfileDoc | null;
  canAccessProtected: boolean;
  mergePrompt: { uid: string } | null;
  signUp: (input: SignUpInput, rememberMe: boolean) => Promise<void>;
  signIn: (input: SignInInput, rememberMe: boolean) => Promise<void>;
  signInWithGoogle: (rememberMe: boolean) => Promise<void>;
  continueAsGuest: () => void;
  signOutUser: () => Promise<void>;
  resolveMerge: (strategy: MergeStrategy) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<UserProfileDoc | null>(null);
  const [mergePrompt, setMergePrompt] = useState<{ uid: string } | null>(null);

  const loadProfileAndStorage = useCallback(async (appUser: AppUser) => {
    setStorageMode('user', appUser.uid);
    const defaultUsername = appUser.displayName || appUser.email?.split('@')[0] || 'Trainer';
    const doc = await ProfileService.ensureProfile(appUser.uid, {
      username: defaultUsername,
      email: appUser.email,
    });
    setProfile(doc);

    const wasGuest = typeof window !== 'undefined' && window.localStorage.getItem(GUEST_FLAG_KEY) === 'true';
    if (wasGuest && (await hasLocalProgressToMerge())) {
      setMergePrompt({ uid: appUser.uid });
    }
    if (typeof window !== 'undefined') window.localStorage.removeItem(GUEST_FLAG_KEY);
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setStorageMode('guest');
      setStatus('guest');
      return;
    }

    const unsubscribe = AuthService.onAuthChange(async (appUser) => {
      setUser(appUser);
      if (appUser) {
        await loadProfileAndStorage(appUser);
        setStatus('signed-in');
      } else {
        const isGuest =
          typeof window !== 'undefined' && window.localStorage.getItem(GUEST_FLAG_KEY) === 'true';
        setProfile(null);
        setStorageMode('guest');
        setStatus(isGuest ? 'guest' : 'signed-out');
      }
    });

    return unsubscribe;
  }, [loadProfileAndStorage]);

  const signUp = useCallback(async (input: SignUpInput, rememberMe: boolean) => {
    await AuthService.setPersistenceMode(rememberMe);
    await AuthService.signUpWithEmail(input);
  }, []);

  const signIn = useCallback(async (input: SignInInput, rememberMe: boolean) => {
    await AuthService.setPersistenceMode(rememberMe);
    await AuthService.signInWithEmail(input);
  }, []);

  const signInWithGoogle = useCallback(async (rememberMe: boolean) => {
    await AuthService.setPersistenceMode(rememberMe);
    await AuthService.signInWithGoogle();
  }, []);

  const continueAsGuest = useCallback(() => {
    if (typeof window !== 'undefined') window.localStorage.setItem(GUEST_FLAG_KEY, 'true');
    setStorageMode('guest');
    setStatus('guest');
  }, []);

  const signOutUser = useCallback(async () => {
    if (typeof window !== 'undefined') window.localStorage.removeItem(GUEST_FLAG_KEY);
    await AuthService.signOutUser();
    setStorageMode('guest');
    setStatus('signed-out');
  }, []);

  const resolveMerge = useCallback(
    async (strategy: MergeStrategy) => {
      if (!mergePrompt) return;
      await mergeGuestProgressIntoAccount(mergePrompt.uid, strategy);
      setMergePrompt(null);
    },
    [mergePrompt]
  );

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    const doc = await ProfileService.getProfile(user.uid);
    setProfile(doc);
  }, [user]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      profile,
      canAccessProtected: status === 'guest' || status === 'signed-in',
      mergePrompt,
      signUp,
      signIn,
      signInWithGoogle,
      continueAsGuest,
      signOutUser,
      resolveMerge,
      refreshProfile,
    }),
    [status, user, profile, mergePrompt, signUp, signIn, signInWithGoogle, continueAsGuest, signOutUser, resolveMerge, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
