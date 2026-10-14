import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// import { InstallPrompt } from '~/components/install-prompt';
import MachiningNavbar from '~/components/machining/machining-navbar';
// import { NotificationPromptModal } from '~/components/notif-prompt-modal';
import { auth } from '~/server/auth';

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  const isStudent = session?.user && session.user.role === Role.STUDENT;
  if (isStudent) {
    redirect('/dashboard');
  } else if (!session) {
    redirect('/auth/sign-in');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }

  return (
    <MachiningNavbar>
      <Suspense
        fallback={<div className="w-full h-full grid place-items-center">Fetching data...</div>}
      >
        {/* <InstallPrompt /> */}
        {/* <NotificationPromptModal /> */}
        {children}
      </Suspense>
    </MachiningNavbar>
  );
}

export const metadata = {
  title: {
    default: 'LMS',
    template: '%s | Machining',
  },
};
