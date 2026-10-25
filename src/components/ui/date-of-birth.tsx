'use client';

import { useEffect, useState } from 'react';
import { Select } from './select';
import { cn } from '@/lib/utils';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const daysIn = (year: number, month: number) => new Date(year || 2000, month, 0).getDate();
const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Day / Month / Year dropdowns for a birth date. Phones open their own wheel
 * pickers, which beat scrolling a calendar back decades. Value is yyyy-mm-dd,
 * or '' until all three parts are chosen.
 */
export function DateOfBirthSelect({
  id,
  value,
  onChange,
  fromYear,
  toYear,
  invalid,
  describedBy,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  /** Oldest year offered */
  fromYear: number;
  /** Most recent year offered (listed first) */
  toYear: number;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [parts, setParts] = useState(() => split(value));

  // Follow outside changes, e.g. the form being cleared or a player loaded for editing.
  useEffect(() => {
    if (value && value !== join(parts)) setParts(split(value));
    if (!value && join(parts)) setParts({ d: 0, m: 0, y: 0 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const update = (next: { d: number; m: number; y: number }) => {
    // Keep the day valid when the month or year changes (31 Jan → Feb).
    if (next.d && next.m && next.d > daysIn(next.y, next.m)) next.d = daysIn(next.y, next.m);
    setParts(next);
    onChange(join(next));
  };

  const years = Array.from({ length: toYear - fromYear + 1 }, (_, i) => toYear - i);
  const maxDay = parts.m ? daysIn(parts.y, parts.m) : 31;
  const aria = { 'aria-invalid': invalid || undefined, 'aria-describedby': describedBy };

  return (
    <div className="grid grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)_minmax(0,1.1fr)] gap-2">
      <Select
        id={id}
        aria-label="Birth day"
        value={parts.d || ''}
        onChange={e => update({ ...parts, d: Number(e.target.value) })}
        className={cn(!parts.d && 'text-ink-3')}
        {...aria}
      >
        <option value="">Day</option>
        {Array.from({ length: maxDay }, (_, i) => (
          <option key={i + 1} value={i + 1}>
            {i + 1}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Birth month"
        value={parts.m || ''}
        onChange={e => update({ ...parts, m: Number(e.target.value) })}
        className={cn(!parts.m && 'text-ink-3')}
        {...aria}
      >
        <option value="">Month</option>
        {MONTHS.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </Select>
      <Select
        aria-label="Birth year"
        value={parts.y || ''}
        onChange={e => update({ ...parts, y: Number(e.target.value) })}
        className={cn(!parts.y && 'text-ink-3')}
        {...aria}
      >
        <option value="">Year</option>
        {years.map(y => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </Select>
    </div>
  );
}

function split(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m ? { y: Number(m[1]), m: Number(m[2]), d: Number(m[3]) } : { d: 0, m: 0, y: 0 };
}

function join({ d, m, y }: { d: number; m: number; y: number }) {
  return d && m && y ? `${y}-${pad(m)}-${pad(d)}` : '';
}
