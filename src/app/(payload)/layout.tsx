/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import config from '@payload-config';
import '@payloadcms/next/css';
import { RootLayout } from '@payloadcms/next/layouts';
import { Role } from '@prisma/client';
import { redirect } from 'next/navigation';
import React, { Suspense } from 'react';

import './custom.scss';
import { auth } from '~/server/auth';

import { importMap } from './admin-cms/importMap.js';
import { serverFunction } from './serverFunction';

type Args = {
  children: React.ReactNode;
};

const Layout = async ({ children }: Args) => {
  const session = await auth();
  const isAdmin =
    session?.user && (session.user.role === Role.ADMIN || session.user.role === Role.SUPERADMIN);
  if (!session || !isAdmin) {
    redirect('/dashboard');
  } else if (!session.user.verified) {
    redirect(`/auth/not-verified?email=${session.user.email}`);
  }
  return (
    <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
      <Suspense
        fallback={
          <div
            style={{
              width: '100% !important',
              minHeight: '100vh !important',
              display: 'flex !important',
              alignItems: 'center !important',
              justifyContent: 'center !important',
              fontWeight: 'bold !important',
              fontFamily: 'monospace !important',
              fontSize: '1.5rem !important',
            }}
          >
            <span>Loading...</span>
          </div>
        }
      >
        {children}
      </Suspense>
    </RootLayout>
  );
};

export default Layout;
