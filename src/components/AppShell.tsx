'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MonitorPlay } from 'lucide-react';
import { useAuction } from '@/lib/auction-context';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { EditAccessControl } from '@/components/EditAccessControl';
import { PoweredBy } from '@/components/PoweredBy';
import { SEASON } from '@/lib/constants';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/register', label: 'Register', admin: false },
  { href: '/auction', label: 'Auction', admin: false },
  { href: '/players', label: 'Players', admin: false },
  { href: '/registrations', label: 'Registrations', admin: true },
];

export function AppShell({
  children,
  wide = false,
}: {
  children: React.ReactNode;
  wide?: boolean;
}) {
  const pathname = usePathname();
  const { isLive } = useAuction();
  const { isEditable } = useEditAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-rule bg-night/85 backdrop-blur-md">
        <div
          className={cn(
            'mx-auto flex h-16 items-center gap-3 px-4 sm:gap-6 sm:px-6',
            wide ? 'max-w-[1920px]' : 'max-w-6xl',
          )}
        >
          <Link href="/" className="group flex h-11 shrink-0 items-center gap-2">
            <span className="font-display text-[28px] font-black leading-none tracking-wide text-ink">
              {SEASON.short}
            </span>
            <span className="hidden font-display text-sm font-bold uppercase tracking-[0.14em] text-cream sm:inline">
              Season {SEASON.season}
            </span>
          </Link>

          <nav
            aria-label="Main"
            className="-mx-1 flex min-w-0 items-center gap-0.5 overflow-x-auto px-1 [scrollbar-width:none] sm:gap-1"
          >
            {NAV.filter(item => !item.admin || isEditable).map(item => {
              const active = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative flex h-10 shrink-0 items-center rounded px-2.5 text-[15px] font-semibold transition-colors sm:px-3',
                    active ? 'text-ink' : 'text-ink-2 hover:text-ink',
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute inset-x-2.5 bottom-0 h-[2px] bg-floodlight sm:inset-x-3" />
                  )}
                </Link>
              );
            })}
            <Link
              href="/stage"
              target="_blank"
              className="hidden h-10 items-center gap-2 rounded px-3 text-[15px] font-semibold text-ink-2 transition-colors hover:text-ink md:flex"
            >
              <MonitorPlay className="h-4 w-4" />
              Stage
              <span className="sr-only">(opens in a new window)</span>
            </Link>
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-3">
            <PoweredBy size="sm" showLabel={false} className="hidden lg:flex" />
            <span
              className={cn(
                'hidden items-center gap-2 text-sm font-medium sm:flex',
                isLive ? 'text-ink-2' : 'text-[#ff8a90]',
              )}
            >
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  isLive ? 'bg-turf shadow-[0_0_0_3px_rgba(126,217,87,0.18)]' : 'bg-ball',
                )}
              />
              {isLive ? 'Live' : 'Reconnecting…'}
            </span>
            <EditAccessControl />
          </div>
        </div>
      </header>

      <main
        className={cn(
          'mx-auto w-full flex-1 px-4 pb-16 pt-6 sm:px-6',
          wide ? 'max-w-[1920px]' : 'max-w-6xl',
        )}
      >
        {children}
      </main>

      <footer className="border-t border-rule">
        <div
          className={cn(
            'mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-6 text-sm text-ink-3 sm:px-6',
            wide ? 'max-w-[1920px]' : 'max-w-6xl',
          )}
        >
          <span>
            {SEASON.league} · {SEASON.year}
          </span>
          <PoweredBy size="md" />
        </div>
      </footer>
    </div>
  );
}
