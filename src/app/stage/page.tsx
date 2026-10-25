'use client';

import { useEffect, useRef, useState } from 'react';
import { Maximize } from 'lucide-react';
import { useAuction } from '@/lib/auction-context';
import { AUCTION_RULES, SEASON } from '@/lib/constants';
import { formatMoney } from '@/lib/utils';
import { Player, Team } from '@/types';
import { SquadLedger } from '@/components/SquadLedger';
import { PlayerPhoto } from '@/components/PlayerPhoto';
import { CategoryTag } from '@/components/ui/badge';
import { PoweredBy } from '@/components/PoweredBy';

const SOLD_HOLD_MS = 6000;

type SoldMoment = { player: Player; team: Team; amount: number; key: number };

export default function StagePage() {
  const { players, teams, loading, currentAuction, lastSale, getMaxBid } =
    useAuction();
  const [sold, setSold] = useState<SoldMoment | null>(null);
  // After the stamp clears, the buying team's purse settles from bright to normal.
  const [settle, setSettle] = useState<{ teamId: string; key: number } | null>(
    null,
  );
  const seenSale = useRef<number | null | undefined>(undefined);

  const currentPlayer = currentAuction.playerId
    ? (players.find(p => p.id === currentAuction.playerId) ?? null)
    : null;

  // Stamp SOLD only for sales that happen while the stage is open.
  useEffect(() => {
    if (loading) return;
    const ts = lastSale?.timestamp ?? null;
    if (seenSale.current === undefined) {
      seenSale.current = ts;
      return;
    }
    if (ts && (seenSale.current === null || ts > seenSale.current)) {
      const player = players.find(p => p.id === lastSale!.playerId);
      const team = teams.find(t => t.id === lastSale!.teamId);
      if (player && team) {
        setSold({ player, team, amount: lastSale!.amount, key: ts });
      }
    }
    seenSale.current = ts;
  }, [lastSale, players, teams, loading]);

  useEffect(() => {
    if (!sold) return;
    const t = setTimeout(() => {
      setSettle({ teamId: sold.team.id, key: sold.key });
      setSold(null);
    }, SOLD_HOLD_MS);
    return () => clearTimeout(t);
  }, [sold]);

  return (
    <div className="relative flex h-screen min-h-[640px] flex-col overflow-hidden bg-night text-ink">
      {/* Floodlights */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[70vh]"
        style={{
          background:
            'radial-gradient(60% 80% at 12% -10%, rgba(232,49,127,0.32), transparent 60%), radial-gradient(60% 80% at 88% -10%, rgba(232,49,127,0.28), transparent 60%), radial-gradient(90% 70% at 50% -30%, rgba(91,42,158,0.35), transparent 70%)',
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-[3vw] pt-[2.4vh]">
        <span className="flex items-baseline gap-[1vw]">
          <span className="font-display text-[clamp(2rem,3vw,3.6rem)] font-black leading-none tracking-wide">
            {SEASON.short}
          </span>
          <span className="font-display text-[clamp(1rem,1.3vw,1.6rem)] font-bold uppercase tracking-[0.16em] text-cream">
            Season {SEASON.season} · Player auction
          </span>
        </span>
        <PoweredBy size="stage" />
      </header>

      <main className="relative z-10 flex min-h-0 flex-1 flex-col px-[3vw] pb-[2.4vh] pt-[2vh]">
        {loading ? null : currentPlayer ? (
          <OnStage
            key={currentPlayer.id}
            player={currentPlayer}
            teams={teams}
            getMaxBid={getMaxBid}
          />
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <h1 className="mb-[1.6vh] font-display text-[clamp(1.4rem,1.8vw,2.4rem)] font-extrabold uppercase tracking-[0.14em] text-ink-2">
              Squads
            </h1>
            <div className="min-h-0 flex-1">
              <SquadLedger
                key={settle?.key}
                teams={teams}
                size="stage"
                recentPlayerId={settle ? lastSale?.playerId : null}
              />
            </div>
          </div>
        )}
      </main>

      {sold && <SoldTakeover key={sold.key} moment={sold} />}
      <FullscreenButton />
    </div>
  );
}

function OnStage({
  player,
  teams,
  getMaxBid,
}: {
  player: Player;
  teams: Team[];
  getMaxBid: (teamId: string, category: Player['category']) => number;
}) {
  return (
    <>
      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,36vh)_minmax(0,1fr)] items-center gap-[4vw] lg:grid-cols-[minmax(0,52vh)_minmax(0,1fr)]">
        <div className="relative animate-rise-in">
          <PlayerPhoto
            name={player.name}
            imageUrl={player.imageUrl}
            sizes="(max-width: 1920px) 30vw, 600px"
            priority
            className="aspect-[4/5] w-full rounded-lg shadow-[0_40px_90px_-30px_rgba(0,0,0,0.9)] ring-1 ring-rule-strong"
          />
        </div>
        <div className="min-w-0 animate-rise-in [animation-delay:120ms]">
          <CategoryTag category={player.category} size="stage" />
          <h1 className="mt-[2.4vh] font-display text-[clamp(3.5rem,7.4vw,9.5rem)] font-black uppercase leading-[0.86] tracking-[0.01em] [overflow-wrap:anywhere] [text-wrap:balance]">
            {player.name}
          </h1>
          <p className="mt-[2.4vh] text-[clamp(1.25rem,1.9vw,2.4rem)] font-medium text-ink-2">
            {player.playingRole} · Age {player.age} · {player.wing}{' '}
            {player.flatNumber}
          </p>
          {player.battingStyle && (
            <p className="mt-[0.8vh] text-[clamp(1.1rem,1.6vw,2rem)] font-medium text-ink-2">
              {player.battingStyle}-hand bat
              {player.bowlingStyle &&
                (player.bowlingStyle === 'None'
                  ? ' · Doesn’t bowl'
                  : ` · ${player.bowlingStyle}-arm bowler`)}
            </p>
          )}
          <p className="mt-[3.2vh] flex items-baseline gap-[1vw]">
            <span className="font-display text-[clamp(1.25rem,1.7vw,2.2rem)] font-bold uppercase tracking-[0.14em] text-ink-2">
              Base price
            </span>
            <span className="tabular font-display text-[clamp(2.6rem,4.4vw,5.6rem)] font-black leading-none text-cream">
              {formatMoney(AUCTION_RULES.minBidAmount[player.category])}
            </span>
          </p>
        </div>
      </div>

      {/* Purse strip */}
      {teams.length > 0 && (
        <div
          className="mt-[2.4vh] grid overflow-hidden rounded-md border border-rule-strong bg-night-2/90"
          style={{
            gridTemplateColumns: `repeat(${teams.length}, minmax(0, 1fr))`,
          }}
        >
          {teams.map((team, i) => {
            const max = getMaxBid(team.id, player.category);
            return (
              <div
                key={team.id}
                className={`flex min-w-0 flex-col justify-between gap-[1vh] px-[1vw] py-[1.4vh] ${i > 0 ? 'border-l border-rule-strong' : ''}`}
              >
                <span className="font-display text-[clamp(1.1rem,1.5vw,2rem)] font-extrabold uppercase leading-[0.95] tracking-wide">
                  {team.name}
                </span>
                <span className="flex flex-col gap-[0.4vh]">
                  <span className="tabular text-[clamp(1.2rem,1.8vw,2.4rem)] font-semibold leading-none text-cream">
                    {formatMoney(team.remainingPurse)}
                  </span>
                  <span
                    className={`tabular text-[clamp(1rem,1.35vw,1.8rem)] font-semibold ${max > 0 ? 'text-ink-2' : 'text-ink-3'}`}
                  >
                    {max > 0 ? (
                      <>
                        Max{' '}
                        <span className="text-cream">{formatMoney(max)}</span>
                      </>
                    ) : (
                      'Can’t bid'
                    )}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}

function SoldTakeover({ moment }: { moment: SoldMoment }) {
  const { player, team, amount } = moment;
  return (
    <div
      role="status"
      aria-live="assertive"
      className="absolute inset-0 z-30 flex items-center justify-center bg-night px-[5vw]"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(50% 60% at 50% 40%, rgba(224,49,58,0.22), transparent 70%)',
        }}
      />
      <div className="relative grid w-full max-w-[1700px] grid-cols-[minmax(0,40vh)_minmax(0,1fr)] items-center gap-[4vw]">
        <PlayerPhoto
          name={player.name}
          imageUrl={player.imageUrl}
          sizes="40vh"
          className="aspect-[4/5] w-full rounded-lg ring-1 ring-rule-strong"
        />
        <div className="min-w-0">
          <div className="relative">
            <p className="font-display text-[clamp(2rem,3.4vw,4.4rem)] font-black uppercase leading-[0.9] text-ink [overflow-wrap:anywhere]">
              {player.name}
            </p>
            <span
              className="absolute -top-[6vh] right-0 inline-block animate-stamp-in rounded-md border-[0.6vh] border-ball px-[1.6vw] py-[0.4vh] font-display text-[clamp(3.5rem,8vw,10rem)] font-black uppercase leading-none tracking-[0.06em] text-ball"
              style={{ boxShadow: 'inset 0 0 0 0.4vh rgba(224,49,58,0.35)' }}
            >
              Sold
            </span>
          </div>
          <p className="mt-[4vh] font-display text-[clamp(1.25rem,1.9vw,2.4rem)] font-bold uppercase tracking-[0.16em] text-ink-2">
            to
          </p>
          <p
            className="mt-[1vh] inline-block bg-night-3 py-[1.6vh] pl-[2.4vw] pr-[3vw] font-display text-[clamp(3rem,5.6vw,7.5rem)] font-black uppercase leading-[0.88] text-ink [text-wrap:balance]"
            style={{
              // The logo's banner: square at the start, swallowtail notch at the end.
              clipPath:
                'polygon(0 0, 100% 0, calc(100% - 0.35em) 50%, 100% 100%, 0 100%)',
              boxShadow: 'inset 0 -0.5vh 0 rgba(232,49,127,0.55)',
            }}
          >
            {team.name}
          </p>
          <p className="tabular mt-[3vh] font-display text-[clamp(4rem,9vw,12rem)] font-black leading-none text-cream">
            {formatMoney(amount)}
          </p>
        </div>
      </div>
    </div>
  );
}

function FullscreenButton() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const wake = () => {
      setVisible(true);
      clearTimeout(t);
      t = setTimeout(() => setVisible(false), 2500);
    };
    wake();
    window.addEventListener('mousemove', wake);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'f' || e.key === 'F') toggle();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      window.removeEventListener('mousemove', wake);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const toggle = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      className={`absolute bottom-4 right-4 z-40 flex h-11 items-center gap-2 rounded-full border border-rule-strong bg-night-2/90 px-4 text-sm font-semibold text-ink-2 transition-opacity duration-300 hover:text-ink ${visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
    >
      <Maximize className="h-4 w-4" />
      Full screen (F)
    </button>
  );
}
