'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout, FormField } from '@/components/auth';
import { useAuth } from '@/hooks/useAuth';
import { AuthError, validateEmail, validatePassword, validatePasswordConfirmation, validateUsername, passwordStrength } from '@/features/auth';

const STRENGTH_LABEL = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLOR = ['bg-neon-red', 'bg-neon-orange', 'bg-neon-yellow', 'bg-neon-cyan', 'bg-neon-blue'];

export default function SignupPage() {
  const router = useRouter();
  const { signUp } = useAuth();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = passwordStrength(password);

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    const usernameResult = validateUsername(username);
    if (!usernameResult.valid) errors.username = usernameResult.message!;
    const emailResult = validateEmail(email);
    if (!emailResult.valid) errors.email = emailResult.message!;
    const passwordResult = validatePassword(password);
    if (!passwordResult.valid) errors.password = passwordResult.message!;
    const confirmResult = validatePasswordConfirmation(password, confirmPassword);
    if (!confirmResult.valid) errors.confirmPassword = confirmResult.message!;
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;

    setLoading(true);
    try {
      await signUp({ username, email, password }, true);
      setSuccess(true);
      setTimeout(() => router.push('/profile'), 1400);
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : 'Could not create your account.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Account Created" subtitle="">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-3 py-6 text-center"
        >
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.1 }}
            className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-neon-cyan text-3xl text-neon-cyan"
          >
            ✓
          </motion.span>
          <p className="font-display text-white">Welcome, {username}!</p>
          <p className="text-sm text-muted">Taking you to your profile…</p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Track XP, ranks, and streaks across every device."
      footer={
        <>
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-neon-blue hover:underline">
            Login
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormField
          id="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          error={fieldErrors.username}
          required
        />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={fieldErrors.email}
          required
        />
        <div>
          <FormField
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
          />
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex h-1.5 flex-1 gap-1 overflow-hidden rounded-full bg-white/10">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-full ${i < strength ? STRENGTH_COLOR[strength] : 'bg-transparent'}`}
                  />
                ))}
              </div>
              <span className="text-[11px] text-muted">{STRENGTH_LABEL[strength]}</span>
            </div>
          )}
        </div>
        <FormField
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          required
        />

        <AnimatePresence>
          {formError && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-lg border border-neon-red/40 bg-neon-red/10 px-3 py-2 text-sm text-neon-red"
            >
              {formError}
            </motion.p>
          )}
        </AnimatePresence>

        <button type="submit" disabled={loading} className="btn-primary mt-1 disabled:opacity-60">
          {loading ? 'Creating Account…' : 'Create Account'}
        </button>
      </form>
    </AuthLayout>
  );
}
