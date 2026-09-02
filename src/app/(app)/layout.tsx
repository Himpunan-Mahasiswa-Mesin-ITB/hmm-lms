import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { type Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import {
  Geist,
  Inter,
  Montserrat,
  Noto_Sans,
  Oxygen,
  Poppins,
  Roboto,
  Roboto_Mono,
  Dancing_Script,
  Exo_2,
  Lobster_Two,
  Caveat,
  Shadows_Into_Light,
} from 'next/font/google';
import Script from 'next/script';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { CustomThemeProvider } from '~/components/providers/custom-theme-provider';
import { DisplaySettingProvider } from '~/components/providers/display-provider';
import { ThemeProvider } from '~/components/providers/theme-provider';
import { ServiceWorkerUpdate } from '~/components/sw-update';
import { Toaster } from '~/components/ui/sonner';
import { TooltipProvider } from '~/components/ui/tooltip';
import { TRPCReactProvider } from '~/trpc/react';

import '~/styles/globals.css';

const APP_NAME = 'HMM ITB';
const APP_DEFAULT_TITLE = 'HMM ITB';
const APP_TITLE_TEMPLATE = '%s | HMM ITB';
const APP_DESCRIPTION =
  'External branding landing page and LMS platform for Himpunan Mahasiswa Mesin ITB.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-roboto',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const oxygen = Oxygen({
  subsets: ['latin'],
  weight: ['300', '400', '700'],
  variable: '--font-oxygen',
});

const notoSans = Noto_Sans({
  subsets: ['latin'],
  variable: '--font-noto-sans',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
});

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dancing-script',
});

const exo2 = Exo_2({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-exo-2',
});

const lobsterTwo = Lobster_Two({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-lobster-two',
});

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-caveat',
});

const shadowsIntoLight = Shadows_Into_Light({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-shadows-into-light',
});

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={` ${geist.variable} ${inter.variable} ${montserrat.variable} ${roboto.variable} ${poppins.variable} ${oxygen.variable} ${notoSans.variable} ${robotoMono.variable} ${dancingScript.variable} ${exo2.variable} ${lobsterTwo.variable} ${caveat.variable} ${shadowsIntoLight.variable} bg-background text-primary-foreground`}
      suppressHydrationWarning
    >
      <Script
        async
        strategy="afterInteractive"
        src="https://www.googletagmanager.com/gtag/js?id=G-08R8EDXS9T"
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
           window.dataLayer = window.dataLayer || [];
           function gtag(){dataLayer.push(arguments);}
           gtag('js', new Date());
           gtag('config', 'G-08R8EDXS9T');
          `,
        }}
      />
      <link rel="manifest" href="/manifest.json" />
      <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      <body>
        <SessionProvider>
          <TRPCReactProvider>
            <NuqsAdapter>
              <DisplaySettingProvider>
                <CustomThemeProvider>
                  <ThemeProvider attribute="class" defaultTheme="light">
                    <TooltipProvider>
                      {/* <RegisterSW /> */}
                      <SpeedInsights />
                      <Analytics />
                      <ServiceWorkerUpdate />
                      {children}
                    </TooltipProvider>
                  </ThemeProvider>
                </CustomThemeProvider>
              </DisplaySettingProvider>
            </NuqsAdapter>
          </TRPCReactProvider>
          <Toaster richColors position="top-center" />
        </SessionProvider>
      </body>
    </html>
  );
}
