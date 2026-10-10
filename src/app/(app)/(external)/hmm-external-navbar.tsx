'use client';

import { LogOut, ChevronDown } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import { useEffect } from 'react';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { cn } from '~/lib/utils';

const EXTERNAL_PAGES: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/', label: 'Beranda' },
  { href: '/about', label: 'About' },
];
const CONTENT_PAGES: ReadonlyArray<{ href: string; label: string }> = [
  { href: '/news', label: 'News' },
  { href: '/achievements', label: 'Achievements' },
  { href: '/event', label: 'Events' },
  { href: '/gallery', label: 'Gallery' },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function HmmExternalNavbar() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false)

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const toastId = toast.loading('Signing out...');
    await signOut();
    toast.dismiss(toastId);
    setIsSigningOut(false);
  };

  const isContentPillarActive = CONTENT_PAGES.some(
    (page) => pathname === page.href,
  );

  return (
    <header className="hmm-nav-sticky relative pt-[env(safe-area-inset-top,0px)]">
      <div className="hmm-nav-inner">
        <Link
          href="/"
          className="group flex min-h-11 min-w-11 shrink-0 items-center gap-2 sm:min-h-0 sm:gap-3"
        >
          <Image
            src="/external/images/logos/logo-hmm.png"
            alt="HMM ITB"
            width={40}
            height={40}
            className="h-8 w-8 object-contain drop-shadow-md sm:h-9 sm:w-9"
            priority
          />
          <div className="hidden flex-col sm:flex">
            <span className="hmm-title text-lg font-bold tracking-wide text-white drop-shadow">
              HMM ITB
            </span>
            {/*<span className="hmm-sans text-[0.6rem] font-medium tracking-[0.2em] text-white/80">
              HIMPUNAN MAHASISWA MESIN ITB
            </span>*/}
          </div>
        </Link>

        <div className="hidden min-w-0 flex-1 items-center justify-end md:flex">
          <nav
            className="hmm-sans hmm-nav-desktop hmm-nav-desktop--centered"
            aria-label="External pages"
          >
            <ul className="flex items-center gap-1">
              {EXTERNAL_PAGES.map((page) => {
                const isActive = pathname === page.href;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'hmm-nav-desktop-link block px-3 py-2 text-xs font-semibold tracking-[0.12em] transition',
                        'focus-visible:ring-2 focus-visible:ring-[var(--color-hmm-yellow)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_srgb,var(--color-hmm-navy-deep)_90%,black)] focus-visible:outline-none',
                        isActive && 'hmm-nav-link--active',
                      )}
                    >
                      {page.label}
                    </Link>
                  </li>
                );
              })}
              <li
              >
                <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                  <DropdownMenuTrigger asChild>
                    <button
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                      className={cn(
                        'hmm-nav-desktop-link inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold tracking-[0.12em] transition',
                        'focus-visible:ring-2 focus-visible:ring-[var(--color-hmm-yellow)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_srgb,var(--color-hmm-navy-deep)_90%,black)] focus-visible:outline-none',
                        isContentPillarActive && 'hmm-nav-link--active',
                      )}
                    >
                      <span>Content Pillar</span>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${dropdownOpen && "rotate-180"}`} />
                    </button>
                  </DropdownMenuTrigger>

                  <DropdownMenuContent
                    align="start"
                    className="min-w-[160px] bg-[color-mix(in_srgb,var(--color-hmm-navy-deep)_42%,transparent)] backdrop-blur-[18px]"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    {CONTENT_PAGES.map((page) => {
                      const isActive = pathname === page.href;
                      return (
                        <DropdownMenuItem key={page.href} asChild>
                          <Link
                            href={page.href}
                            onClick={() => setDropdownOpen(false)}
                            className={cn(
                              'w-full cursor-pointer text-xs font-semibold tracking-wider',
                              isActive && 'font-bold text-[var(--color-hmm-yellow)]',
                            )}
                          >
                            {page.label}
                          </Link>
                        </DropdownMenuItem>
                      );
                    })}
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>

              {status === 'authenticated' && (
                <li>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'hmm-nav-desktop-link block px-3 py-2 text-xs font-semibold tracking-[0.12em] transition',
                      'focus-visible:ring-2 focus-visible:ring-[var(--color-hmm-yellow)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[color-mix(in_srgb,var(--color-hmm-navy-deep)_90%,black)] focus-visible:outline-none',
                      pathname === '/dashboard' && 'hmm-nav-link--active',
                    )}
                  >
                    Dashboard
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {status === 'loading' ? (
            <div className="h-9 w-20 animate-pulse rounded bg-white/20" />
          ) : status === 'authenticated' && session?.user ? (
            <div className="flex items-center gap-3">
              {/* <span className="hidden text-sm font-medium text-white sm:block">
                {session.user.name}
              </span> */}
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-hmm-yellow)] text-sm font-bold text-[var(--color-hmm-navy-deep)]">
                {getInitials(session.user.name)}
              </div>
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="hidden border rounded-lg p-2 text-xs font-semibold text-red-600/80 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50 sm:block"
              >
                <LogOut className="size-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth/sign-in" className="hmm-nav-signin">
              Sign In
            </Link>
          )}
        </div>

        <button
          type="button"
          className="hmm-nav-mobile-toggle md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
          aria-expanded={mobileOpen}
          aria-controls="hmm-mobile-nav"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          data-hmm-open={mobileOpen ? 'true' : 'false'}
        >
          <span className="hmm-nav-mobile-icon" aria-hidden="true">
            <span className="hmm-nav-mobile-icon__line" />
            <span className="hmm-nav-mobile-icon__line" />
            <span className="hmm-nav-mobile-icon__line" />
          </span>
        </button>
      </div>

      <div
        id="hmm-mobile-nav"
        className={cn(
          'hmm-nav-mobile md:hidden',
          mobileOpen ? 'hmm-nav-mobile--open' : 'hmm-nav-mobile--closed',
        )}
      >
        <nav className="hmm-sans" aria-label="External mobile pages">
          <div className="mt-2 border-white/10 pt-2">
            <p className="px-2 pb-1 text-[10px] font-bold tracking-widest text-white/50 uppercase text-center">
              HMM ITB
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {EXTERNAL_PAGES.map((page) => {
                const isActive = pathname === page.href;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'hmm-nav-mobile-link block px-2 py-2.5 text-center text-xs font-semibold tracking-[0.12em] text-white/90',
                        isActive && 'hmm-nav-link--active',
                        !isActive && 'border-white/25!'
                      )}
                    >
                      {page.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="mt-2 border-t border-white/10 pt-2">
            <p className="px-2 pb-1 text-[10px] font-bold tracking-widest text-white/50 uppercase text-center">
              Content Pillar
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {CONTENT_PAGES.map((page) => {
                const isActive = pathname === page.href;
                return (
                  <li key={page.href}>
                    <Link
                      href={page.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        'hmm-nav-mobile-link block px-2 py-2.5 text-center text-xs font-semibold tracking-[0.12em] text-white/90',
                        isActive && 'hmm-nav-link--active',
                        !isActive && 'border-white/25!'
                      )}
                    >
                      {page.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {status === 'loading' ? (
            <div className="mt-3 flex items-center justify-center gap-3 border-t border-white/10 pt-3">
              <div className="h-5 w-24 animate-pulse rounded bg-white/20" />
              <div className="h-9 w-9 animate-pulse rounded-full bg-white/20" />
            </div>
          ) : status === 'authenticated' && session?.user ? (
            <div className="mt-3 flex items-center justify-center gap-3 border-t border-white/10 pt-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--color-hmm-yellow)] text-sm font-bold text-[var(--color-hmm-navy-deep)] shrink-0">
                {getInitials(session.user.name)}
              </div>
              <span className="text-sm font-medium text-white">{session.user.name}</span>
            </div>
          ) : (
            <Link
              href="/auth/sign-in"
              onClick={() => setMobileOpen(false)}
              className="hmm-nav-signin mt-3 inline-flex w-full justify-center"
            >
              Sign In
            </Link>
          )}

          <ul className="grid grid-cols-2 gap-2">
            {status === 'authenticated' && (
              <li className="my-2 w-full">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'hmm-nav-mobile-link block px-2 py-2.5 text-center text-xs font-semibold tracking-[0.12em] text-white/90',
                    pathname === '/dashboard' && 'hmm-nav-link--active',
                    pathname !== '/dashboard' && 'border-white/25!',
                  )}
                >
                  Dashboard
                </Link>
              </li>
            )}
            {status === 'authenticated' && (
              <button
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="flex w-full items-center justify-center gap-2 py-2.5 text-center text-xs font-semibold tracking-[0.12em] border-red-600/50! text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
              </button>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}
