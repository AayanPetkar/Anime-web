// NextAuth handler (Google + Email providers). Configured in the auth step.
// import NextAuth from 'next-auth';
// import { authOptions } from '@/lib/auth/authOptions';
//
// const handler = NextAuth(authOptions);
// export { handler as GET, handler as POST };

export async function GET() {
  return new Response(JSON.stringify({ status: 'not configured yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST() {
  return new Response(JSON.stringify({ status: 'not configured yet' }), {
    status: 501,
    headers: { 'Content-Type': 'application/json' },
  });
}
