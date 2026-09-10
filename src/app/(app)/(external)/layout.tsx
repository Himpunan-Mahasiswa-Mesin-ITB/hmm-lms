import { Inter, Montserrat } from 'next/font/google';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';

import '~/styles/external.css';
import { auth } from '~/server/auth';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700'],
});

export default async function ExternalLayout({ children }: { children: ReactNode }) {
  // temporary redirect to sign-in page if not authenticated and to dashboard if authenticated
  const session = await auth();
  if (!session) {
    redirect('/auth/sign-in');
  } else if (session) {
    redirect('/dashboard');
  }
  return (
    <div
      className={`${inter.variable} ${montserrat.variable} hmm-external min-h-screen scroll-smooth`}
    >
      {children}
    </div>
  );
}
