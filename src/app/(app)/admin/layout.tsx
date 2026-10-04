import { redirect } from 'next/navigation';
import { Suspense } from 'react';

import AdminNavbar from '~/components/admin/navbar';
import { ADMIN_ACCESS_ROLES } from '~/constants/access';
import { auth } from '~/server/auth';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const isAdmin =
    session?.user && (ADMIN_ACCESS_ROLES.includes(session?.user.role));
  // Redirect non-admin users
  if (!session || !isAdmin) {
    redirect('/dashboard');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }

  return (
    <AdminNavbar>
      <Suspense
        fallback={<div className="w-full h-full grid place-items-center">Fetching data...</div>}
      >
        {children}
      </Suspense>
    </AdminNavbar>
  );
}

export const metadata = {
  title: {
    template: '%s - Admin Panel',
    default: 'Admin Panel',
  },
  description: 'Admin panel for HMM ITB',
};
