import type { Metadata } from 'next';
import { Orbitron, Inter } from 'next/font/google';
import { AuthProvider } from '@/hooks/useAuth';
import { MergeProgressDialog } from '@/components/auth';
import './globals.css';

const orbitron = Orbitron({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800', '900'],
  variable: '--font-display',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Anime Skill AR Trainer',
  description:
    'Learn iconic anime techniques through real-time webcam pose and hand tracking. Entertainment/fitness experience — visual effects are fictional.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${orbitron.variable} ${inter.variable}`}>
      <body className="font-body antialiased min-h-screen bg-background overflow-x-hidden">
        <AuthProvider>
          <MergeProgressDialog />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
