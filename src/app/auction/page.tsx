'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuction } from '@/lib/auction-context';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { cn, formatMoney, sortPlayersByName, titleCase } from '@/lib/utils';
import { AUCTION_RULES, CATEGORY_META, CATEGORY_ORDER } from '@/lib/constants';
import { Player, PlayerCategory, Team } from '@/types';
import { AppShell } from '@/components/AppShell';
import { SquadLedger, SQUAD_SIZE } from '@/components/SquadLedger';
import { PlayerPhoto } from '@/components/PlayerPhoto';
import { Button } from '@/components/ui/button';
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
import { Gavel, Search, Undo2, Expand, Loader2 } from 'lucide-react';

type Confirm =
  | { kind: 'undo'; player: Player; team: Team; amount: number }
  | { kind: 'remove'; player: Player; team: Team }
  | null;

export default function AuctionPage() {
  const {
    players,
    teams,
    loading,
    currentAuction,
    setCurrentAuctionPlayer,
    addPlayerToTeam,
    getMaxBid,
    lastSale,
    reverseLastSale,
    removePlayerFromTeam,
  } = useAuction();
  const { isEditable } = useEditAuth();
  const toast = useToast();

  const [confirm, setConfirm] = useState<Confirm>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [showPhoto, setShowPhoto] = useState(false);
  const [recentPlayerId, setRecentPlayerId] = useState<string | null>(null);

  const currentPlayer = currentAuction.playerId
    ? players.find(p => p.id === currentAuction.playerId) ?? null
    : null;

  const soldCount = players.filter(p => p.teamId).length;
  const spent = players.reduce((sum, p) => sum + (p.teamId ? p.soldAmount || 0 : 0), 0);

  const lastSalePlayer = lastSale ? players.find(p => p.id === lastSale.playerId) : undefined;
  const lastSaleTeam = lastSale ? teams.find(t => t.id === lastSale.teamId) : undefined;

  const requestUndo = () => {
    if (!lastSale || !lastSalePlayer || !lastSaleTeam) return;
    setConfirm({ kind: 'undo', player: lastSalePlayer, team: lastSaleTeam, amount: lastSale.amount });
  };

  const requestRemove = (player: Player) => {
    const team = teams.find(t => t.id === player.teamId);
    if (team) setConfirm({ kind: 'remove', player, team });
  };

  const runConfirm = async () => {
    if (!confirm) return;
    setConfirmBusy(true);
    const ok =
      confirm.kind === 'undo'
        ? await reverseLastSale()
        : await removePlayerFromTeam(confirm.player.id);
    setConfirmBusy(false);
    setConfirm(null);
    if (ok) {
      toast({
        tone: 'success',
        title:
          confirm.kind === 'undo'
            ? `Sale undone: ${titleCase(confirm.player.name)} is back in the pool`
            : `${titleCase(confirm.player.name)} removed from ${titleCase(confirm.team.name)}`,
        detail: 'The team’s purse has been restored.',
      });
    } else {
      toast({
        tone: 'error',
        title: 'Couldn’t change the sale',
        detail: 'Nothing was changed. Check the connection and try again.',
      });
    }
  };

  return (
    <AppShell wide>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] xl:grid-cols-[minmax(0,28rem)_minmax(0,1fr)] xl:gap-8">
        {/* On the block */}
        <section aria-labelledby="block-heading">
          <h1
            id="block-heading"
            className="mb-3 font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-2"
          >
            On the block
          </h1>

          {loading ? (
            <div className="h-72 animate-pulse rounded-md border border-rule bg-night-2" />
          ) : currentPlayer ? (
            <div className="overflow-hidden rounded-md border border-rule-strong bg-night-2">
              <OnTheBlock
                player={currentPlayer}
                onExpand={() => setShowPhoto(true)}
                onReturn={isEditable ? () => setCurrentAuctionPlayer(null) : undefined}
              />
              {isEditable ? (
                <SalePanel
                  key={currentPlayer.id}
                  player={currentPlayer}
                  teams={teams}
                  getMaxBid={getMaxBid}
                  onSell={async (teamId, amount) => {
                    const team = teams.find(t => t.id === teamId);
                    const ok = await addPlayerToTeam(currentPlayer.id, teamId, amount);
                    if (ok) {
                      setRecentPlayerId(currentPlayer.id);
                      toast({
                        tone: 'success',
                        title: `Sold: ${titleCase(currentPlayer.name)} to ${titleCase(team?.name ?? '')}`,
                        detail: `${formatMoney(amount)} logged.`,
                      });
                    } else {
                      toast({
                        tone: 'error',
                        title: 'Sale not recorded',
                        detail: 'The amount is outside this team’s limits, or the connection dropped. Check and try again.',
                      });
                    }
                    return ok;
                  }}
                />
              ) : (
                <p className="border-t border-rule px-5 py-4 text-[15px] text-ink-2">
                  Bidding happens in the room. The result shows here as soon as the hammer falls.
                </p>
              )}
            </div>
          ) : isEditable ? (
            <PlayerPicker
              players={players}
              onPick={id => setCurrentAuctionPlayer(id)}
            />
          ) : (
            <div className="rounded-md border border-rule-strong bg-night-2 px-5 py-10 text-center">
              <p className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
                Waiting for the next chit
              </p>
              <p className="mt-2 text-[15px] text-ink-2">
                The next player appears here as soon as they’re drawn.
              </p>
            </div>
          )}

          {lastSale && lastSalePlayer && lastSaleTeam && (
            <div className="mt-4 flex items-center justify-between gap-3 border-y border-rule py-2 pl-1">
              <p className="min-w-0 text-sm text-ink-2">
                <span className="font-semibold text-ink-3">Last sale </span>
                <span className="font-semibold text-ink">{titleCase(lastSalePlayer.name)}</span>
                {' to '}
                {titleCase(lastSaleTeam.name)}
                {' · '}
                <span className="tabular font-semibold text-cream">{formatMoney(lastSale.amount)}</span>
              </p>
              {isEditable && (
                <Button variant="ghost" onClick={requestUndo} className="shrink-0">
                  <Undo2 />
                  Undo
                </Button>
              )}
            </div>
          )}
        </section>

        {/* Squads */}
        <section aria-labelledby="squads-heading" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            <h2
              id="squads-heading"
              className="font-display text-sm font-bold uppercase tracking-[0.16em] text-ink-2"
            >
              Squads
            </h2>
            <p className="tabular text-sm text-ink-2">
              {soldCount} sold · {formatMoney(spent)} spent
            </p>
          </div>
          {loading ? (
            <div className="h-[36rem] animate-pulse rounded-md border border-rule bg-night-2" />
          ) : (
            <SquadLedger
              teams={teams}
              focusCategory={currentPlayer?.category ?? null}
              getMaxBid={getMaxBid}
              recentPlayerId={recentPlayerId}
              onRemoveSale={isEditable ? requestRemove : undefined}
            />
          )}
        </section>
      </div>

      {/* Confirmations */}
      <Dialog open={!!confirm} onOpenChange={open => !open && !confirmBusy && setConfirm(null)}>
        {confirm && (
          <DialogContent className="max-w-md" onClose={() => setConfirm(null)}>
            <DialogHeader>
              <DialogTitle>{confirm.kind === 'undo' ? 'Undo last sale?' : 'Remove this sale?'}</DialogTitle>
              <DialogDescription>
                {titleCase(confirm.player.name)} goes back into the pool and{' '}
                {titleCase(confirm.team.name)} gets{' '}
                <span className="tabular font-semibold text-cream">
                  {formatMoney(confirm.kind === 'undo' ? confirm.amount : confirm.player.soldAmount || 0)}
                </span>{' '}
                back in their purse.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setConfirm(null)} disabled={confirmBusy}>
                Keep the sale
              </Button>
              <Button variant="danger" onClick={runConfirm} disabled={confirmBusy} data-autofocus>
                {confirmBusy && <Loader2 className="animate-spin" />}
                {confirm.kind === 'undo' ? 'Undo sale' : 'Remove sale'}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Large photo */}
      <Dialog open={showPhoto && !!currentPlayer} onOpenChange={setShowPhoto}>
        {currentPlayer && (
          <DialogContent className="max-w-3xl p-0" onClose={() => setShowPhoto(false)}>
            <div className="grid sm:grid-cols-[minmax(0,1fr)_16rem]">
              <PlayerPhoto
                name={currentPlayer.name}
                imageUrl={currentPlayer.imageUrl}
                sizes="(max-width: 640px) 100vw, 480px"
                priority
                className="aspect-[4/5] w-full"
              />
              <div className="flex flex-col gap-4 p-6">
                <DialogHeader>
                  <DialogTitle className="text-3xl leading-[0.95]">{currentPlayer.name}</DialogTitle>
                  <DialogDescription>
                    {currentPlayer.playingRole} · Age {currentPlayer.age}
                  </DialogDescription>
                </DialogHeader>
                <CategoryTag category={currentPlayer.category} size="md" className="self-start" />
                <dl className="grid gap-3 text-[15px]">
                  <div>
                    <dt className="text-ink-3">Home</dt>
                    <dd className="text-ink">
                      {currentPlayer.wing} · Flat {currentPlayer.flatNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-ink-3">Base price</dt>
                    <dd className="tabular font-semibold text-cream">
                      {formatMoney(AUCTION_RULES.minBidAmount[currentPlayer.category])}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </AppShell>
  );
}

function OnTheBlock({
  player,
  onExpand,
  onReturn,
}: {
  player: Player;
  onExpand: () => void;
  onReturn?: () => void;
}) {
  return (
    <div className="flex gap-4 p-4 sm:gap-5 sm:p-5">
      <button
        type="button"
        onClick={onExpand}
        className="group relative h-40 w-32 shrink-0 overflow-hidden rounded sm:h-44 sm:w-36"
      >
        <PlayerPhoto
          name={player.name}
          imageUrl={player.imageUrl}
          sizes="144px"
          priority
          className="h-full w-full"
        />
        <span className="absolute bottom-1.5 right-1.5 flex h-8 w-8 items-center justify-center rounded bg-night/80 text-ink opacity-80 transition-opacity group-hover:opacity-100">
          <Expand className="h-4 w-4" />
        </span>
        <span className="sr-only">View larger photo of {player.name}</span>
      </button>
      <div className="flex min-w-0 flex-1 flex-col">
        <CategoryTag category={player.category} size="md" className="self-start" />
        <p className="mt-2.5 font-display text-[clamp(1.75rem,2.4vw,2.4rem)] font-black uppercase leading-[0.92] tracking-wide text-ink [overflow-wrap:anywhere]">
          {player.name}
        </p>
        <p className="mt-2 text-[15px] text-ink-2">
          {player.playingRole} · Age {player.age} · {player.wing} {player.flatNumber}
        </p>
        <p className="mt-auto pt-3 text-[15px] text-ink-2">
          Base{' '}
          <span className="tabular text-lg font-semibold text-cream">
            {formatMoney(AUCTION_RULES.minBidAmount[player.category])}
          </span>
        </p>
        {onReturn && (
          <button
            type="button"
            onClick={onReturn}
            className="-ml-1 mt-1 min-h-11 self-start px-1 text-sm font-semibold text-ink-3 underline decoration-rule-strong underline-offset-4 hover:text-ink"
          >
            Put back in the pool
          </button>
        )}
      </div>
    </div>
  );
}

function SalePanel({
  player,
  teams,
  getMaxBid,
  onSell,
}: {
  player: Player;
  teams: Team[];
  getMaxBid: (teamId: string, category: PlayerCategory) => number;
  onSell: (teamId: string, amount: number) => Promise<boolean>;
}) {
  const [teamId, setTeamId] = useState('');
  const [lakhs, setLakhs] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  const base = AUCTION_RULES.minBidAmount[player.category];
  const team = teams.find(t => t.id === teamId);
  const maxBid = team ? getMaxBid(team.id, player.category) : 0;
  const amount = Math.round((parseFloat(lakhs) || 0) * 100000);

  const amountError =
    !lakhs || !team
      ? null
      : amount < base
        ? `Below the ${formatMoney(base)} base price.`
        : amount > maxBid
          ? `${titleCase(team.name)} can bid at most ${formatMoney(maxBid)}.`
          : null;
  const ready = !!team && !!lakhs && !amountError && amount > 0;

  const chooseTeam = (id: string) => {
    setTeamId(id);
    requestAnimationFrame(() => amountRef.current?.focus());
  };

  // 1–7 picks a team when you are not typing in a field.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('input, textarea, select, [role="dialog"]')) return;
      const n = Number(e.key);
      if (!Number.isInteger(n) || n < 1 || n > teams.length) return;
      const t = teams[n - 1];
      if (getMaxBid(t.id, player.category) > 0) {
        e.preventDefault();
        chooseTeam(t.id);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready || submitting) return;
    setSubmitting(true);
    const ok = await onSell(teamId, amount);
    setSubmitting(false);
    if (!ok) amountRef.current?.focus();
  };

  return (
    <form onSubmit={submit} className="border-t border-rule-strong bg-night-3/40 p-4 sm:p-5">
      <fieldset>
        <legend className="mb-2 flex w-full items-baseline justify-between text-sm font-semibold text-ink-2">
          <span>Sold to</span>
          {teams.length > 0 && (
            <span className="hidden text-xs font-medium text-ink-3 lg:inline">Keys 1–{teams.length}</span>
          )}
        </legend>
        {teams.length === 0 && (
          <p className="rounded border border-dashed border-rule-strong px-3 py-4 text-sm text-ink-2">
            No teams yet. Players can be sold once the teams are set up.
          </p>
        )}
        <div role="radiogroup" aria-label="Team" className="grid gap-1">
          {teams.map((t, i) => {
            const max = getMaxBid(t.id, player.category);
            const full = t.players.length >= SQUAD_SIZE ||
              t.categoryCount[player.category] >= AUCTION_RULES.categoryLimits[player.category].max;
            const selected = t.id === teamId;
            return (
              <button
                key={t.id}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={max <= 0}
                onClick={() => chooseTeam(t.id)}
                className={cn(
                  'flex min-h-10 items-center gap-3 rounded border px-3 text-left transition-colors',
                  selected
                    ? 'border-floodlight bg-floodlight/15'
                    : 'border-rule-strong bg-night hover:border-ink-3',
                  'disabled:cursor-not-allowed disabled:border-rule disabled:bg-transparent',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] font-display text-sm font-bold',
                    selected ? 'bg-floodlight text-white' : 'bg-night-3 text-ink-2',
                  )}
                >
                  {i + 1}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 truncate font-display text-[15px] font-bold uppercase tracking-wide',
                    max > 0 ? 'text-ink' : 'text-ink-3',
                  )}
                >
                  {t.name}
                </span>
                <span
                  className={cn(
                    'tabular shrink-0 text-sm font-semibold',
                    max > 0 ? 'text-ink-2' : 'text-ink-3',
                  )}
                >
                  {max > 0
                    ? <>up to <span className="text-cream">{formatMoney(max)}</span></>
                    : full
                      ? `${CATEGORY_META[player.category].label} full`
                      : 'Purse too low'}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <Field
        id="hammer-price"
        label="Hammer price"
        className="mt-4"
        error={amountError}
        hint={
          team
            ? `Base ${formatMoney(base)} · ${titleCase(team.name)} can go to ${formatMoney(maxBid)}`
            : `Base ${formatMoney(base)} · pick the team first`
        }
      >
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold text-ink-3">
            ₹
          </span>
          <Input
            ref={amountRef}
            id="hammer-price"
            type="number"
            inputMode="decimal"
            step="0.5"
            min={base / 100000}
            value={lakhs}
            onChange={e => setLakhs(e.target.value)}
            placeholder={String(base / 100000)}
            aria-invalid={!!amountError}
            aria-describedby={amountError ? 'hammer-price-error' : 'hammer-price-hint'}
            className="tabular h-14 pl-8 pr-16 text-2xl font-semibold"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[15px] font-semibold text-ink-3">
            Lakh
          </span>
        </div>
      </Field>

      <div className="mt-4 flex flex-col gap-3">
        <p aria-live="polite" className="min-h-[1.5rem] text-[15px] text-ink-2">
          {ready && team ? (
            <>
              <span className="font-semibold text-ink">{titleCase(team.name)}</span> pays{' '}
              <span className="tabular font-semibold text-cream">{formatMoney(amount)}</span>
              {' · '}
              <span className="tabular">{formatMoney(team.remainingPurse - amount)}</span> left
              {' · '}
              <span className="tabular">
                {team.players.length + 1}/{SQUAD_SIZE}
              </span>{' '}
              players
            </>
          ) : null}
        </p>
        <Button type="submit" variant="primary" size="lg" disabled={!ready || submitting} className="w-full">
          {submitting ? <Loader2 className="animate-spin" /> : <Gavel />}
          Record sale
        </Button>
      </div>
    </form>
  );
}

function PlayerPicker({
  players,
  onPick,
}: {
  players: Player[];
  onPick: (id: string) => void;
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<PlayerCategory | 'ALL'>('ALL');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const pool = useMemo(() => sortPlayersByName(players.filter(p => !p.teamId)), [players]);
  const results = pool.filter(
    p =>
      (category === 'ALL' || p.category === category) &&
      p.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  useEffect(() => setActive(0), [query, category]);

  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${active}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive(a => Math.min(a + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive(a => Math.max(a - 1, 0));
    } else if (e.key === 'Enter' && results[active]) {
      e.preventDefault();
      onPick(results[active].id);
    }
  };

  const counts = CATEGORY_ORDER.map(c => ({
    c,
    n: pool.filter(p => p.category === c).length,
  }));

  return (
    <div className="rounded-md border border-rule-strong bg-night-2 p-4 sm:p-5">
      <label htmlFor="pool-search" className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
        Who’s on the chit?
      </label>
      <p className="mt-1 text-[15px] text-ink-2">Type the name, then press Enter to put them on the block.</p>

      <div className="relative mt-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
        <Input
          id="pool-search"
          role="combobox"
          aria-expanded="true"
          aria-controls="pool-list"
          aria-activedescendant={results[active] ? `pool-${results[active].id}` : undefined}
          autoComplete="off"
          autoFocus
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="Search the pool"
          className="h-12 pl-9 text-base"
        />
      </div>

      <div role="group" aria-label="Filter by category" className="mt-3 flex flex-wrap gap-1.5">
        {[{ c: 'ALL' as const, n: pool.length }, ...counts].map(({ c, n }) => {
          const on = category === c;
          return (
            <button
              key={c}
              type="button"
              aria-pressed={on}
              onClick={() => setCategory(c)}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-sm font-semibold transition-colors',
                on ? 'border-cream bg-cream text-night' : 'border-rule-strong text-ink-2 hover:text-ink',
              )}
            >
              {c !== 'ALL' && (
                <span
                  aria-hidden
                  className="h-2 w-2 rounded-[2px]"
                  style={{ background: CATEGORY_META[c].ink }}
                />
              )}
              {c === 'ALL' ? 'All' : CATEGORY_META[c].label}
              <span className={cn('tabular', on ? 'text-night/70' : 'text-ink-3')}>{n}</span>
            </button>
          );
        })}
      </div>

      <ul
        id="pool-list"
        ref={listRef}
        role="listbox"
        aria-label="Players in the pool"
        className="mt-3 max-h-[min(26rem,50vh)] overflow-y-auto rounded border border-rule"
      >
        {results.length === 0 ? (
          <li className="px-4 py-6 text-center text-[15px] text-ink-2">
            {pool.length === 0
              ? 'Every player has been sold. That’s the auction.'
              : `No one in the pool matches “${query}”.`}
          </li>
        ) : (
          results.map((p, i) => (
            <li
              key={p.id}
              id={`pool-${p.id}`}
              data-index={i}
              role="option"
              aria-selected={i === active}
              onMouseEnter={() => setActive(i)}
              onClick={() => onPick(p.id)}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-3 border-b border-rule px-3 last:border-b-0',
                i === active ? 'bg-night-3' : '',
              )}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-ink">{titleCase(p.name)}</span>
                <span className="block text-sm text-ink-3">
                  {p.playingRole} · {p.wing} {p.flatNumber}
                </span>
              </span>
              <CategoryTag category={p.category} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
