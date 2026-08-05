'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

interface RequireAuthProps {
  children: React.ReactNode;
}

/**
 * Client-side guard used on /profile, /settings, and /training/[skillId].
 * Firebase Auth state lives in the browser SDK, so this checks client-side
 * rather than in middleware — acceptable for a client-rendered SPA-style
 * flow like this one; a session-cookie-based server check would be the
 * next hardening step if this needs to resist a determined user editing
 * localStorage, which isn't a concern for this app's threat model.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const { status, canAccessProtected } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (status !== 'loading' && !canAccessProtected) {
      router.replace('/login');
    }
  }, [status, canAccessProtected, router]);

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-neon-blue border-t-transparent" />
          <p className="text-sm text-muted">Loading…</p>
        </div>
      </div>
    );
  }

  if (!canAccessProtected) return null;

  return <>{children}</>;
}
