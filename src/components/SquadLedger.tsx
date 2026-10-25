'use client';

import { ChevronDown, X } from 'lucide-react';
import { Player, PlayerCategory, Team } from '@/types';
import { AUCTION_RULES, CATEGORY_META, CATEGORY_ORDER } from '@/lib/constants';
import { cn, formatMoney, scorebookName, titleCase } from '@/lib/utils';

type Slot = { category: PlayerCategory; index: number; firstOfGroup: boolean; groupSize: number };

// One line per squad place, grouped by category in squad order.
const SLOTS: Slot[] = CATEGORY_ORDER.flatMap(category => {
  const size = AUCTION_RULES.categoryLimits[category].max;
  return Array.from({ length: size }, (_, index) => ({
    category,
    index,
    firstOfGroup: index === 0,
    groupSize: size,
  }));
});

const SQUAD_SIZE = AUCTION_RULES.maxPlayers;

function playerAt(team: Team, slot: Slot): Player | undefined {
  return team.players.filter(p => p.category === slot.category)[slot.index];
}

interface LedgerProps {
  teams: Team[];
  size?: 'console' | 'stage';
  /** Category of the player on the block: open places in it are marked. */
  focusCategory?: PlayerCategory | null;
  getMaxBid?: (teamId: string, category: PlayerCategory) => number;
  /** Player just sold: their line settles from bright to normal. */
  recentPlayerId?: string | null;
  onRemoveSale?: (player: Player) => void;
}

export function SquadLedger(props: LedgerProps) {
  if (props.teams.length === 0) {
    const stage = props.size === 'stage';
    return (
      <div
        className={cn(
          'flex h-full flex-col items-center justify-center rounded-md border border-dashed border-rule-strong text-center',
          stage ? 'min-h-[50vh] gap-[1.5vh] p-[4vh]' : 'gap-2 px-6 py-14',
        )}
      >
        <p
          className={cn(
            'font-display font-black uppercase tracking-wide text-ink',
            stage ? 'text-[clamp(2rem,4vw,4.5rem)]' : 'text-2xl',
          )}
        >
          Teams to be announced
        </p>
        <p className={cn('text-ink-2', stage ? 'text-[clamp(1rem,1.5vw,1.8rem)]' : 'text-[15px]')}>
          Squads appear here once the teams are set up.
        </p>
      </div>
    );
  }
  return (
    <>
      <LedgerGrid {...props} />
      {props.size !== 'stage' && <LedgerStack {...props} />}
    </>
  );
}

function TeamMaxBid({
  maxBid,
  stage,
}: {
  maxBid: number;
  stage?: boolean;
}) {
  return maxBid > 0 ? (
    <span className={cn('tabular font-semibold text-ink-2', stage ? 'text-2xl' : 'text-sm')}>
      Max <span className="text-cream">{formatMoney(maxBid)}</span>
    </span>
  ) : (
    <span className={cn('font-semibold text-ink-3', stage ? 'text-2xl' : 'text-sm')}>
      Can’t bid
    </span>
  );
}

function LedgerGrid({
  teams,
  size = 'console',
  focusCategory,
  getMaxBid,
  recentPlayerId,
  onRemoveSale,
}: LedgerProps) {
  const stage = size === 'stage';

  return (
    <div
      role="table"
      aria-label="Squads"
      className={cn(
        'grid overflow-hidden rounded-md border border-rule-strong bg-night-2',
        stage ? 'grid h-full' : 'hidden lg:grid',
      )}
      style={{
        gridTemplateColumns: `${stage ? '9rem' : '6.5rem'} repeat(${teams.length}, minmax(0, 1fr))`,
        // On the projector the 13 lines share whatever height the screen has, so nothing is cut off.
        ...(stage && { gridTemplateRows: `auto repeat(${SLOTS.length}, minmax(0, 1fr))` }),
      }}
    >
      {/* Header row */}
      <div role="row" className="contents">
        <div
          role="columnheader"
          className={cn(
            'flex items-end border-b border-rule-strong px-3 pb-3 font-display font-bold uppercase tracking-[0.12em] text-ink-3',
            stage ? 'text-lg' : 'text-xs',
          )}
        >
          Squad
        </div>
        {teams.map(team => {
          const maxBid =
            focusCategory && getMaxBid ? getMaxBid(team.id, focusCategory) : null;
          return (
            <div
              key={team.id}
              role="columnheader"
              className={cn(
                'flex flex-col justify-between gap-2 border-b border-l border-rule-strong bg-night-3/60',
                stage ? 'min-h-[clamp(5.5rem,14vh,9.5rem)] px-4 py-[1.2vh]' : 'min-h-[7.25rem] p-3',
              )}
            >
              <span
                title={team.name}
                className={cn(
                  'font-display font-extrabold uppercase leading-[0.95] tracking-wide text-ink',
                  stage ? 'text-[clamp(1.1rem,min(1.6vw,2.9vh),2.1rem)]' : 'text-[17px]',
                )}
              >
                {team.name}
              </span>
              <span className="flex flex-col gap-0.5">
                <span className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      'tabular whitespace-nowrap font-semibold text-cream',
                      stage ? 'text-[clamp(1rem,min(1.6vw,3vh),1.5rem)]' : 'text-[15px]',
                    )}
                  >
                    {formatMoney(team.remainingPurse)}
                  </span>
                  <span
                    className={cn('tabular whitespace-nowrap text-ink-2', stage ? 'text-[clamp(0.85rem,min(1.2vw,2.4vh),1.25rem)]' : 'text-sm')}
                  >
                    {team.players.length}/{SQUAD_SIZE}
                  </span>
                </span>
                {maxBid !== null && <TeamMaxBid maxBid={maxBid} stage={stage} />}
              </span>
            </div>
          );
        })}
      </div>

      {/* Squad lines */}
      {SLOTS.map((slot, rowIndex) => {
        const meta = CATEGORY_META[slot.category];
        const focused = focusCategory === slot.category;
        const groupRule = slot.firstOfGroup && rowIndex > 0 ? 'border-t border-t-rule-strong' : '';
        return (
          <div role="row" className="contents" key={`${slot.category}-${slot.index}`}>
            <div
              role="rowheader"
              className={cn(
                'flex items-center gap-2 border-b border-rule px-3',
                groupRule,
                stage ? 'min-h-0' : 'h-11',
              )}
            >
              {slot.firstOfGroup ? (
                <>
                  <span
                    aria-hidden
                    className="h-2.5 w-2.5 shrink-0 rounded-[2px]"
                    style={{ background: meta.ink }}
                  />
                  <span
                    className={cn(
                      'font-display font-bold uppercase tracking-[0.08em]',
                      stage ? 'text-[clamp(0.95rem,min(1.3vw,2.6vh),1.25rem)]' : 'text-[13px]',
                      focused ? 'text-ink' : 'text-ink-2',
                    )}
                  >
                    {meta.label}
                  </span>
                </>
              ) : (
                <span className="sr-only">{meta.label}</span>
              )}
            </div>
            {teams.map(team => {
              const player = playerAt(team, slot);
              const open = !player && focused;
              const recent = player && player.id === recentPlayerId;
              return (
                <div
                  key={team.id}
                  role="cell"
                  className={cn(
                    'group relative flex min-w-0 items-center border-b border-l border-rule',
                    groupRule,
                    stage ? 'min-h-0 px-3' : 'h-11 px-2.5',
                    recent && 'animate-ink-settle',
                  )}
                  style={
                    player
                      ? ({
                          background: meta.wash,
                          '--settle-from': 'rgba(232, 49, 127, 0.55)',
                          '--settle-to': meta.wash,
                        } as React.CSSProperties)
                      : undefined
                  }
                >
                  {player ? (
                    <>
                      <span
                        className={cn(
                          'flex min-w-0 flex-1',
                          stage
                            ? 'items-baseline justify-between gap-2 max-xl:flex-col max-xl:items-start max-xl:justify-center max-xl:gap-0 max-xl:leading-tight'
                            : 'flex-col justify-center leading-tight',
                        )}
                      >
                        <span
                          title={player.name}
                          className={cn(
                            'truncate font-condensed font-semibold text-ink',
                            stage ? 'text-[clamp(0.95rem,min(1.25vw,2.6vh),1.5rem)]' : 'text-[14px]',
                          )}
                        >
                          <span aria-hidden>{scorebookName(player.name)}</span>
                          <span className="sr-only">{titleCase(player.name)}</span>
                        </span>
                        <span
                          className={cn(
                            'tabular shrink-0 font-semibold text-cream',
                            stage ? 'text-[clamp(0.9rem,min(1.15vw,2.4vh),1.4rem)]' : 'text-xs',
                          )}
                        >
                          {formatMoney(player.soldAmount || 0)}
                        </span>
                      </span>
                      {onRemoveSale && (
                        <button
                          type="button"
                          onClick={() => onRemoveSale(player)}
                          className="absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded bg-night-2 text-ink-2 opacity-0 transition-opacity hover:text-[#ff8a90] focus-visible:opacity-100 group-hover:opacity-100"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">
                            Remove {player.name} from {team.name}
                          </span>
                        </button>
                      )}
                    </>
                  ) : open ? (
                    <span
                      aria-label="Open place"
                      className="mx-0.5 h-[60%] w-full rounded-[3px] border border-dashed"
                      style={{ borderColor: meta.ink, opacity: 0.55 }}
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** Phone and tablet: one continuous ruled sheet — each team's entries, then its open places. */
function LedgerStack({
  teams,
  focusCategory,
  getMaxBid,
  onRemoveSale,
}: LedgerProps) {
  return (
    <div className="divide-y divide-rule-strong overflow-hidden rounded-md border border-rule-strong bg-night-2 lg:hidden">
      {teams.map(team => {
        const maxBid =
          focusCategory && getMaxBid ? getMaxBid(team.id, focusCategory) : null;
        return (
          <details
            key={team.id}
            open
            className="group [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 bg-night-3/60 px-4 py-3.5">
              <span className="min-w-0 flex-1">
                <span className="block font-display text-xl font-extrabold uppercase leading-tight tracking-wide text-ink">
                  {team.name}
                </span>
                <span className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-0.5 text-[15px]">
                  <span className="tabular font-semibold text-cream">
                    {formatMoney(team.remainingPurse)} left
                  </span>
                  <span className="tabular text-ink-2">
                    {team.players.length}/{SQUAD_SIZE} players
                  </span>
                  {maxBid !== null && <TeamMaxBid maxBid={maxBid} />}
                </span>
              </span>
              <ChevronDown
                aria-hidden
                className="h-5 w-5 shrink-0 text-ink-3 transition-transform duration-200 group-open:rotate-180"
              />
            </summary>
            <ol className="border-t border-rule-strong">
              {CATEGORY_ORDER.flatMap(category => {
                const meta = CATEGORY_META[category];
                return team.players
                  .filter(p => p.category === category)
                  .map((player, i) => (
                    <li
                      key={player.id}
                      className="flex min-h-12 items-center gap-3 border-b border-rule px-4 py-2"
                      style={{ background: meta.wash }}
                    >
                      <span
                        className={cn(
                          'w-[4.5rem] shrink-0 font-display text-[13px] font-bold uppercase tracking-[0.08em]',
                          meta.text,
                        )}
                      >
                        {i === 0 ? meta.label : <span className="sr-only">{meta.label}</span>}
                      </span>
                      <span className="min-w-0 flex-1 font-condensed text-[16px] font-semibold leading-tight text-ink [overflow-wrap:anywhere]">
                        {titleCase(player.name)}
                      </span>
                      <span className="tabular shrink-0 font-semibold text-cream">
                        {formatMoney(player.soldAmount || 0)}
                      </span>
                      {onRemoveSale && (
                        <button
                          type="button"
                          onClick={() => onRemoveSale(player)}
                          className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded text-ink-3 hover:text-[#ff8a90]"
                        >
                          <X className="h-4 w-4" />
                          <span className="sr-only">
                            Remove {player.name} from {team.name}
                          </span>
                        </button>
                      )}
                    </li>
                  ));
              })}
              <li className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-3 text-sm text-ink-2">
                {team.players.length >= SQUAD_SIZE ? (
                  <span className="font-semibold text-ink">Squad complete</span>
                ) : (
                  <>
                    <span className="font-semibold text-ink-3">Open</span>
                    {CATEGORY_ORDER.map(category => {
                      const open =
                        AUCTION_RULES.categoryLimits[category].max -
                        team.players.filter(p => p.category === category).length;
                      if (open <= 0) return null;
                      const meta = CATEGORY_META[category];
                      return (
                        <span key={category} className="inline-flex items-center gap-1.5">
                          <span
                            aria-hidden
                            className="h-2 w-2 rounded-[2px]"
                            style={{ background: meta.ink }}
                          />
                          <span className={cn(focusCategory === category && 'font-semibold text-ink')}>
                            {meta.label} <span className="tabular">{open}</span>
                          </span>
                        </span>
                      );
                    })}
                  </>
                )}
              </li>
            </ol>
          </details>
        );
      })}
    </div>
  );
}

export { SLOTS, SQUAD_SIZE };
