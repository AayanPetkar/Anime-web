import { redirect } from 'next/navigation';

// Canonical login route is /login (see src/app/login/page.tsx). This path
// is kept only so any old link to /auth/login still lands somewhere.
export default function LegacyLoginRedirect() {
  redirect('/login');
}
