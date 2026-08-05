'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AuthLayout, FormField } from '@/components/auth';
import { AuthService, AuthError, validateEmail } from '@/features/auth';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const result = validateEmail(email);
    if (!result.valid) {
      setError(result.message!);
      return;
    }

    setLoading(true);
    try {
      await AuthService.sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Could not send the reset email.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle=""
        footer={
          <Link href="/login" className="font-semibold text-neon-blue hover:underline">
            Back to Login
          </Link>
        }
      >
        <div className="flex flex-col items-center gap-3 py-4 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-neon-cyan text-2xl text-neon-cyan">
            ✉️
          </span>
          <p className="text-sm text-muted">
            If an account exists for <span className="text-white">{email}</span>, a password
            reset link is on its way.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="font-semibold text-neon-blue hover:underline">
          Back to Login
        </Link>
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
          error={error ?? undefined}
          required
        />
        <button type="submit" disabled={loading} className="btn-primary mt-1 disabled:opacity-60">
          {loading ? 'Sending…' : 'Send Reset Link'}
        </button>
      </form>
    </AuthLayout>
  );
}
