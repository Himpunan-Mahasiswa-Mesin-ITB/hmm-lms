import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';

// import { WeeklyPodiumPopup } from '~/components/hall-of-fame/weekly-podium-popup';
// import { InstallPrompt } from '~/components/install-prompt';
import MainNavbar from '~/components/main/navbar';
// import { NotificationPromptModal } from '~/components/notif-prompt-modal';
import { auth } from '~/server/auth';

export default async function Layout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await auth();

  const isMachining = session?.user && session.user.role === Role.MACHINING;

  if (isMachining) {
    redirect('/machining');
  } else if (!session) {
    redirect('/auth/sign-in');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }

  return (
    <MainNavbar>
      <Suspense
        fallback={<div className="w-full h-full grid place-items-center">Fetching data...</div>}
      >
        {/*<InstallPrompt />*/}
        {/* <WeeklyPodiumPopup /> */}
        {/* <NotificationPromptModal /> */}
        {children}
      </Suspense>
    </MainNavbar>
  );
}

export const metadata = {
  title: {
    default: 'LMS',
    template: '%s | HMM LMS',
  },
};
