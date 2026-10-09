import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import { SUPERADMIN_ACCESS_ROLES } from '~/constants/access';
import { auth } from '~/server/auth';

export default async function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isSuperadminAccessAllowed =
    session?.user && SUPERADMIN_ACCESS_ROLES.includes(session?.user.role);

  if (!session || !isSuperadminAccessAllowed) {
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
