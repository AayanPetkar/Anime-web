import { redirect } from 'next/navigation';

// Canonical signup route is /signup (see src/app/signup/page.tsx). This path
// is kept only so any old link to /auth/register still lands somewhere.
export default function LegacyRegisterRedirect() {
  redirect('/signup');
}
