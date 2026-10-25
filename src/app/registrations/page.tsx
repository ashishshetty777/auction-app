'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Download, Loader2, Lock, Trash2, UserPlus } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { PlayerPhoto } from '@/components/PlayerPhoto';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { CategoryTag, StatusPill } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { useAuction } from '@/lib/auction-context';
import { CATEGORY_META, CATEGORY_ORDER, SEASON } from '@/lib/constants';
import { BOWLING_LABEL, PLAYED_LABEL, Registration } from '@/lib/registration';
import { cn, titleCase } from '@/lib/utils';
import { PlayerCategory } from '@/types';

type Tab = 'PENDING' | 'ADDED';

export default function RegistrationsPage() {
  const { isEditable, adminKey } = useEditAuth();
  const { players, refreshData } = useAuction();
  const toast = useToast();
  const [rows, setRows] = useState<Registration[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [tab, setTab] = useState<Tab>('PENDING');
  const [deleting, setDeleting] = useState<Registration | null>(null);

  const load = useCallback(async () => {
    if (!adminKey) return;
    try {
      const res = await fetch('/api/registrations', { headers: { 'x-admin-key': adminKey }, cache: 'no-store' });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setRows(data.data);
      setFailed(false);
    } catch {
      setFailed(true);
    }
  }, [adminKey]);

  // New sign-ups keep arriving while the admin works, so check every 15s.
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  const addToPool = async (reg: Registration, category: PlayerCategory) => {
    const res = await fetch(`/api/registrations/${reg.id}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey ?? '' },
      body: JSON.stringify({ category }),
    });
    const data = await res.json();
    if (!data.success) {
      toast({ tone: 'error', title: 'Not added', detail: data.error });
      return;
    }
    toast({ tone: 'success', title: `${titleCase(reg.name)} is in the pool`, detail: CATEGORY_META[category].label });
    await Promise.all([load(), refreshData()]);
  };

  const remove = async () => {
    if (!deleting) return;
    const res = await fetch(`/api/registrations/${deleting.id}`, {
      method: 'DELETE',
      headers: { 'x-admin-key': adminKey ?? '' },
    });
    const data = await res.json();
    if (data.success) toast({ tone: 'success', title: `${titleCase(deleting.name)}’s registration deleted` });
    else toast({ tone: 'error', title: 'Not deleted', detail: data.error });
    setDeleting(null);
    load();
  };

  if (!isEditable) {
    return (
      <AppShell>
        <div className="mx-auto mt-10 max-w-md rounded-md border border-rule-strong bg-night-2 p-6 text-center">
          <Lock className="mx-auto h-6 w-6 text-cream" aria-hidden />
          <h1 className="mt-3 font-display text-3xl font-black uppercase tracking-wide text-ink">Registrations</h1>
          <p className="mt-2 text-[15px] text-ink-2">
            Only admins can see registrations. Unlock editing with the button at the top right.
          </p>
        </div>
      </AppShell>
    );
  }

  const pending = rows?.filter(r => r.status === 'PENDING') ?? [];
  const added = rows?.filter(r => r.status === 'ADDED') ?? [];
  const shown = tab === 'PENDING' ? pending : added;

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase leading-none tracking-wide text-ink sm:text-5xl">
            Registrations
          </h1>
          <p className="tabular mt-2 text-[15px] text-ink-2">
            {rows ? `${rows.length} received · ${pending.length} waiting for a category` : 'Loading…'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => rows && downloadCsv(rows)} disabled={!rows?.length}>
            <Download />
            Download CSV
          </Button>
        </div>
      </div>

      <div role="tablist" aria-label="Registrations" className="mt-6 flex gap-1 border-b border-rule">
        {([
          ['PENDING', 'Waiting', pending.length],
          ['ADDED', 'Added to pool', added.length],
        ] as const).map(([value, label, n]) => (
          <button
            key={value}
            role="tab"
            type="button"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={cn(
              'relative h-11 px-4 text-[15px] font-semibold transition-colors',
              tab === value ? 'text-ink' : 'text-ink-2 hover:text-ink',
            )}
          >
            {label} <span className="tabular text-ink-3">{n}</span>
            {tab === value && <span className="absolute inset-x-3 -bottom-px h-[2px] bg-floodlight" />}
          </button>
        ))}
      </div>

      {failed && !rows ? (
        <p role="alert" className="mt-8 text-[15px] text-[#ff8a90]">
          Couldn’t load registrations. Lock and unlock editing again, then reload.
        </p>
      ) : !rows ? (
        <div className="mt-4 grid gap-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-28 animate-pulse rounded border border-rule bg-night-2" />
          ))}
        </div>
      ) : shown.length === 0 ? (
        <div className="mt-10 rounded-md border border-rule px-6 py-12 text-center">
          <p className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
            {tab === 'PENDING' ? 'Nobody waiting' : 'Nobody added yet'}
          </p>
          <p className="mt-2 text-[15px] text-ink-2">
            {tab === 'PENDING' ? (
              <>
                Share the{' '}
                <Link href="/register" className="font-semibold text-ink underline underline-offset-4">
                  registration link
                </Link>{' '}
                with the password to collect players for Season {SEASON.season}.
              </>
            ) : (
              'Players you add from the Waiting tab show up here.'
            )}
          </p>
        </div>
      ) : (
        <ul aria-label={tab === 'PENDING' ? 'Waiting for a category' : 'Added to pool'}>
          {shown.map(reg => (
            <RegistrationRow
              key={reg.id}
              reg={reg}
              poolCategory={players.find(p => p.id === reg.playerId)?.category}
              onAdd={addToPool}
              onDelete={() => setDeleting(reg)}
            />
          ))}
        </ul>
      )}

      <Dialog open={!!deleting} onOpenChange={open => !open && setDeleting(null)}>
        {deleting && (
          <DialogContent className="max-w-md" onClose={() => setDeleting(null)}>
            <DialogHeader>
              <DialogTitle>Delete {titleCase(deleting.name)}’s registration?</DialogTitle>
              <DialogDescription>
                Use this for duplicates or test entries. They can register again with the same mobile number afterwards.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setDeleting(null)}>
                Keep it
              </Button>
              <Button variant="danger" onClick={remove} data-autofocus>
                Delete registration
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </AppShell>
  );
}

function RegistrationRow({
  reg,
  poolCategory,
  onAdd,
  onDelete,
}: {
  reg: Registration;
  poolCategory?: PlayerCategory;
  onAdd: (reg: Registration, category: PlayerCategory) => Promise<void>;
  onDelete: () => void;
}) {
  const [category, setCategory] = useState<PlayerCategory | ''>('');
  const [busy, setBusy] = useState(false);
  const selectId = `cat-${reg.id}`;

  return (
    <li className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 border-b border-rule py-4 lg:grid-cols-[4.5rem_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_17rem] lg:items-start">
      <PlayerPhoto
        name={reg.name}
        imageUrl={reg.imageUrl}
        sizes="72px"
        className="row-span-2 h-[5.5rem] w-[4.5rem] rounded lg:row-span-1"
      />
      <div className="min-w-0">
        <p className="font-semibold text-ink">{titleCase(reg.name)}</p>
        <p className="text-sm text-ink-2">
          Age {reg.age} · {reg.wing} {reg.flatNumber}
        </p>
        <p className="tabular text-sm text-ink-3">{reg.mobileNumber}</p>
      </div>
      <dl className="col-start-2 grid grid-cols-[auto_1fr] gap-x-3 text-sm lg:col-auto">
        <dt className="text-ink-3">Role</dt>
        <dd className="text-ink">{reg.playingRole}</dd>
        <dt className="text-ink-3">Bats</dt>
        <dd className="text-ink">{reg.battingStyle} hand</dd>
        <dt className="text-ink-3">Bowls</dt>
        <dd className="text-ink">{BOWLING_LABEL[reg.bowlingStyle]}</dd>
      </dl>
      <dl className="col-start-2 grid grid-cols-[auto_1fr] gap-x-3 text-sm lg:col-auto">
        <dt className="text-ink-3">T-shirt</dt>
        <dd className="text-ink">
          {reg.tshirtSize} · <span className="font-semibold">{reg.tshirtName}</span>{' '}
          <span className="tabular">#{reg.tshirtNumber}</span>
        </dd>
        <dt className="text-ink-3">Last season</dt>
        <dd className="text-ink">{PLAYED_LABEL[reg.playedLastSeason]}</dd>
        {reg.remark && (
          <>
            <dt className="text-ink-3">Remark</dt>
            <dd className="text-ink [overflow-wrap:anywhere]">{reg.remark}</dd>
          </>
        )}
        <dt className="text-ink-3">Received</dt>
        <dd className="text-ink-2">
          {new Date(reg.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })}
        </dd>
      </dl>

      <div className="col-start-2 lg:col-auto">
        {reg.status === 'PENDING' ? (
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={async e => {
              e.preventDefault();
              if (!category) return;
              setBusy(true);
              await onAdd(reg, category);
              setBusy(false);
            }}
          >
            <div className="min-w-[9rem] flex-1">
              <label htmlFor={selectId} className="mb-1 block text-sm font-semibold text-ink-2">
                Category
              </label>
              <Select id={selectId} value={category} onChange={e => setCategory(e.target.value as PlayerCategory)}>
                <option value="">Choose</option>
                {CATEGORY_ORDER.map(c => (
                  <option key={c} value={c}>
                    {CATEGORY_META[c].label}
                  </option>
                ))}
              </Select>
            </div>
            <Button type="submit" variant="primary" disabled={!category || busy}>
              {busy ? <Loader2 className="animate-spin" /> : <UserPlus />}
              Add to pool
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onDelete}
              className="hover:text-[#ff8a90]"
              title={`Delete ${reg.name}’s registration`}
            >
              <Trash2 />
              <span className="sr-only">Delete {reg.name}’s registration</span>
            </Button>
          </form>
        ) : (
          <p className="flex flex-wrap items-center gap-2 text-sm">
            <StatusPill>In the pool</StatusPill>
            {poolCategory && <CategoryTag category={poolCategory} />}
          </p>
        )}
      </div>
    </li>
  );
}

function downloadCsv(rows: Registration[]) {
  const header = [
    'Name', 'Mobile', 'Wing', 'Flat', 'Date of birth', 'Age', 'Playing role', 'Batting', 'Bowling',
    'T-shirt size', 'Name on T-shirt', 'Number on T-shirt', 'Played last season', 'Remark', 'Status', 'Photo', 'Registered',
  ];
  const cell = (v: string | number | undefined) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const lines = rows.map(r =>
    [
      titleCase(r.name), r.mobileNumber, r.wing, r.flatNumber, r.dateOfBirth, r.age, r.playingRole,
      `${r.battingStyle} hand`, BOWLING_LABEL[r.bowlingStyle], r.tshirtSize, r.tshirtName, r.tshirtNumber,
      PLAYED_LABEL[r.playedLastSeason], r.remark, r.status === 'ADDED' ? 'In the pool' : 'Waiting',
      r.imageUrl.startsWith('/') ? `${window.location.origin}${r.imageUrl}` : r.imageUrl,
      new Date(r.createdAt).toLocaleString('en-IN'),
    ].map(cell).join(','),
  );
  // BOM so Excel opens the ₹ and names in UTF-8
  const blob = new Blob(['﻿' + [header.map(cell).join(','), ...lines].join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `scl-season-${SEASON.season}-registrations.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
