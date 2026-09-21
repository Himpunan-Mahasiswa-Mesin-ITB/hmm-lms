import { Role } from '@prisma/client';
import { Inter, Montserrat } from 'next/font/google';
import { redirect } from 'next/navigation';

import '~/styles/external.css';
import type { ReactNode } from 'react';
import { HmmExternalNavbar } from './hmm-external-navbar';

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
  const session = await auth();

  if (!session) {
    console.log("Redirected!")
    redirect('/auth/sign-in');
  }

  if (session.user.role !== Role.SUPERADMIN) {
    console.log("Redirected!")
    redirect('/dashboard');
  }

  return (
    <div
      className={`${inter.variable} ${montserrat.variable} hmm-external min-h-screen scroll-smooth`}
    >
      <HmmExternalNavbar />
      {children}
    </div>
  );
}
