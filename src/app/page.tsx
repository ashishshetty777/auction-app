'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ClipboardPen, Gavel, MonitorPlay, Users, RotateCcw, Loader2 } from 'lucide-react';
import { useAuction } from '@/lib/auction-context';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { AUCTION_RULES, CATEGORY_ORDER, SEASON } from '@/lib/constants';
import { formatMoney, titleCase } from '@/lib/utils';
import { AppShell } from '@/components/AppShell';
import { PoweredBy } from '@/components/PoweredBy';
import { SeasonLogo } from '@/components/SeasonLogo';
import { buttonVariants, Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';
import { CategoryTag } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Home() {
  const { players, teams, currentAuction, loading } = useAuction();
  const { isEditable, adminKey } = useEditAuth();
  const toast = useToast();
  const [showReset, setShowReset] = useState(false);
  const [resetText, setResetText] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const sold = players.filter(p => p.teamId).length;
  const onBlock = currentAuction.playerId
    ? players.find(p => p.id === currentAuction.playerId)
    : undefined;

  const handleReset = async () => {
    try {
      setIsResetting(true);
      const response = await fetch('/api/reset', { method: 'POST', headers: { 'x-admin-key': adminKey ?? '' } });
      const data = await response.json();

      if (data.success) {
        window.location.reload();
      } else {
        toast({ tone: 'error', title: 'Reset failed', detail: 'Nothing was deleted. Try again.' });
      }
    } catch (error) {
      console.error('Error resetting database:', error);
      toast({ tone: 'error', title: 'Reset failed', detail: 'Couldn’t reach the server. Nothing was deleted.' });
    } finally {
      setIsResetting(false);
    }
  };

  const squadSize = AUCTION_RULES.maxPlayers;

  return (
    <AppShell>
      {/* Identity */}
      <section className="grid items-center gap-8 pt-4 md:grid-cols-[minmax(0,17rem)_minmax(0,1fr)] md:gap-12 md:pt-10">
        <SeasonLogo className="mx-auto h-auto w-56 overflow-hidden rounded-lg shadow-[0_30px_70px_-25px_rgba(232,49,127,0.55)] ring-1 ring-rule-strong md:w-full" />
        <div>
          <h1 className="font-display text-[clamp(3rem,7vw,5.75rem)] font-black uppercase leading-[0.86] tracking-wide text-ink [text-wrap:balance]">
            {SEASON.league}
          </h1>
          <p className="mt-4 font-display text-xl font-bold uppercase tracking-[0.14em] text-cream">
            Season {SEASON.season} · Player auction · {SEASON.auctionDate}
          </p>
          <p className="mt-5 min-h-[1.75rem] text-lg text-ink-2" aria-live="polite">
            {loading ? (
              <span className="inline-block h-5 w-64 animate-pulse rounded bg-night-3 align-middle" />
            ) : onBlock ? (
              <>
                On the block now:{' '}
                <span className="font-semibold text-ink">{titleCase(onBlock.name)}</span>
              </>
            ) : sold === 0 ? (
              teams.length === 0 ? (
                <>Teams will be announced before the auction.</>
              ) : (
                <>{players.length} players in the pool across {teams.length} teams.</>
              )
            ) : (
              <>
                <span className="tabular font-semibold text-ink">{sold}</span> of{' '}
                <span className="tabular">{players.length}</span> players sold so far.
              </>
            )}
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/register" className={buttonVariants({ variant: 'primary', size: 'lg' })}>
              <ClipboardPen />
              Register to play
            </Link>
            <Link href="/auction" className={buttonVariants({ size: 'lg' })}>
              <Gavel />
              Go to the auction
            </Link>
            <Link href="/stage" target="_blank" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              <MonitorPlay />
              Open the stage
            </Link>
            <Link href="/players" className={buttonVariants({ variant: 'ghost', size: 'lg' })}>
              <Users />
              Players
            </Link>
          </div>
          <p className="mt-3 text-sm text-ink-3">
            Registration for Season {SEASON.season} is open. Keep the password from the organisers handy.
          </p>
          <PoweredBy size="lg" className="mt-8 flex-wrap" />
        </div>
      </section>

      <div className="mt-16 grid gap-10 lg:grid-cols-2 lg:gap-12">
        {/* Teams */}
        <section aria-labelledby="teams-heading">
          <h2 id="teams-heading" className="font-display text-3xl font-black uppercase tracking-wide text-ink">
            Teams
          </h2>
          <table className="mt-4 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule-strong text-sm text-ink-3">
                <th scope="col" className="py-2 pr-3 font-semibold">Team</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Purse left</th>
                <th scope="col" className="py-2 text-right font-semibold">Squad</th>
              </tr>
            </thead>
            <tbody>
              {(loading ? [] : teams).map(team => (
                <tr key={team.id} className="border-b border-rule">
                  <th scope="row" className="py-3 pr-3 font-display text-lg font-extrabold uppercase leading-tight tracking-wide text-ink">
                    {team.name}
                  </th>
                  <td className="tabular py-3 pr-3 text-right font-semibold text-cream">
                    {formatMoney(team.remainingPurse)}
                  </td>
                  <td className="tabular py-3 text-right text-ink-2">
                    {team.players.length}/{squadSize}
                  </td>
                </tr>
              ))}
              {!loading && teams.length === 0 && (
                <tr className="border-b border-rule">
                  <td colSpan={3} className="py-4 text-[15px] text-ink-2">
                    Teams will be announced before the auction.
                  </td>
                </tr>
              )}
              {loading &&
                Array.from({ length: AUCTION_RULES.totalTeams }, (_, i) => (
                  <tr key={i} className="border-b border-rule">
                    <td colSpan={3} className="py-3">
                      <span className="block h-5 animate-pulse rounded bg-night-2" />
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </section>

        {/* Rules */}
        <section aria-labelledby="rules-heading">
          <h2 id="rules-heading" className="font-display text-3xl font-black uppercase tracking-wide text-ink">
            Squad rules
          </h2>
          <p className="mt-2 text-[15px] text-ink-2">
            Every team has a <span className="tabular font-semibold text-cream">{formatMoney(AUCTION_RULES.teamPurse)}</span> purse
            and must finish with exactly <span className="tabular font-semibold text-ink">{squadSize}</span> players.
            The console only offers a team a price it can afford while still filling every place.
          </p>
          <table className="mt-4 w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-rule-strong text-sm text-ink-3">
                <th scope="col" className="py-2 pr-3 font-semibold">Category</th>
                <th scope="col" className="py-2 pr-3 text-right font-semibold">Places</th>
                <th scope="col" className="py-2 text-right font-semibold">Base price</th>
              </tr>
            </thead>
            <tbody>
              {CATEGORY_ORDER.map(c => (
                <tr key={c} className="border-b border-rule">
                  <th scope="row" className="py-3 pr-3 font-normal">
                    <CategoryTag category={c} size="md" />
                  </th>
                  <td className="tabular py-3 pr-3 text-right text-ink">
                    {AUCTION_RULES.categoryLimits[c].max}
                  </td>
                  <td className="tabular py-3 text-right font-semibold text-cream">
                    {formatMoney(AUCTION_RULES.minBidAmount[c])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      {isEditable && (
        <section
          aria-labelledby="admin-heading"
          className="mt-16 flex flex-wrap items-center justify-between gap-4 rounded-md border border-ball/40 px-5 py-4"
        >
          <div>
            <h2 id="admin-heading" className="font-semibold text-ink">Reset the auction</h2>
            <p className="text-sm text-ink-2">
              Deletes every sale and puts every player back in the pool. Players and registrations stay.
            </p>
          </div>
          <Button variant="danger-quiet" onClick={() => { setResetText(''); setShowReset(true); }}>
            <RotateCcw />
            Reset…
          </Button>
        </section>
      )}

      <Dialog open={showReset} onOpenChange={open => !isResetting && setShowReset(open)}>
        <DialogContent className="max-w-md" onClose={() => setShowReset(false)}>
          <DialogHeader>
            <DialogTitle>Reset everything?</DialogTitle>
            <DialogDescription>
              All {sold} sales are deleted, every purse goes back to {formatMoney(AUCTION_RULES.teamPurse)},
              and every player goes back in the pool. This can’t be undone.
            </DialogDescription>
          </DialogHeader>
          <form
            className="mt-5"
            onSubmit={e => {
              e.preventDefault();
              if (resetText === 'RESET') handleReset();
            }}
          >
            <Field id="reset-confirm" label="Type RESET to confirm">
              <Input
                id="reset-confirm"
                data-autofocus
                autoComplete="off"
                value={resetText}
                onChange={e => setResetText(e.target.value)}
              />
            </Field>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowReset(false)} disabled={isResetting}>
                Cancel
              </Button>
              <Button type="submit" variant="danger" disabled={resetText !== 'RESET' || isResetting}>
                {isResetting && <Loader2 className="animate-spin" />}
                Reset auction
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
