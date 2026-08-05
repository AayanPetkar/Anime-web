'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout, FormField } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthError } from '@/features/auth';

export default function LoginPage() {
  const router = useRouter();
  const { signIn, signInWithGoogle, continueAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<'email' | 'google' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading('email');
    try {
      await signIn({ email, password }, rememberMe);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Could not sign in. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const handleGoogle = async () => {
    setError(null);
    setLoading('google');
    try {
      await signInWithGoogle(rememberMe);
      router.push('/profile');
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Could not sign in with Google.');
    } finally {
      setLoading(null);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    router.push('/skills');
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to sync your training progress across devices."
      footer={
        <>
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="font-semibold text-neon-blue hover:underline">
            Create Account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-muted">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-white/30 bg-black/30 accent-neon-blue"
            />
            Remember me
          </label>
          <Link href="/forgot-password" className="text-neon-blue hover:underline">
            Forgot Password?
          </Link>
        </div>

        {error && (
          <p className="rounded-lg border border-neon-red/40 bg-neon-red/10 px-3 py-2 text-sm text-neon-red">
            {error}
          </p>
        )}

        <button type="submit" disabled={loading !== null} className="btn-primary mt-1 disabled:opacity-60">
          {loading === 'email' ? 'Signing In…' : 'Login'}
        </button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs uppercase tracking-wide text-muted">or</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      <div className="flex flex-col gap-3">
        <button onClick={handleGoogle} disabled={loading !== null} className="btn-ghost disabled:opacity-60">
          {loading === 'google' ? 'Connecting…' : 'Continue with Google'}
        </button>
        <button onClick={handleGuest} className="btn-ghost">
          Continue as Guest
        </button>
      </div>
    </AuthLayout>
  );
}
