import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { BP_ACCESS_ROLES } from '~/constants/access';
import { auth } from '~/server/auth';

export default async function BPLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isBPAccessAllowed =
    session?.user && (BP_ACCESS_ROLES.includes(session?.user.role));

  // Redirect non-bp role access users
  if (!session || !isBPAccessAllowed) {
    redirect('/dashboard');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }

  return (
    <Suspense
      fallback={<div className="w-full h-full grid place-items-center">Fetching data...</div>}
    >
      {children}
    </Suspense>
  );
}
