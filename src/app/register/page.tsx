'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, CheckCircle2, Loader2, Lock, RotateCcw } from 'lucide-react';
import { AppShell } from '@/components/AppShell';
import { Button } from '@/components/ui/button';
import { Field, Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { DateOfBirthSelect } from '@/components/ui/date-of-birth';
import { REGISTRATION, SEASON, SOCIETY } from '@/lib/constants';
import { cn, titleCase } from '@/lib/utils';
import {
  BOWLING_LABEL,
  EMPTY_REGISTRATION,
  PLAYED_LABEL,
  PLAYING_ROLES,
  RegistrationErrors,
  RegistrationInput,
  ageOn,
  flatsByFloor,
  validateRegistration,
} from '@/lib/registration';

// The password is remembered for this tab, so a family registering two people
// only types it once.
const PASS_KEY = 'scl-register-pass';
const FEE = `₹${REGISTRATION.fee.toLocaleString('en-IN')}`;

const FIELD_ORDER: (keyof RegistrationInput)[] = [
  'name',
  'mobileNumber',
  'wing',
  'flatNumber',
  'dateOfBirth',
  'imageUrl',
  'playingRole',
  'battingStyle',
  'bowlingStyle',
  'tshirtSize',
  'tshirtSizeOther',
  'tshirtName',
  'tshirtNumber',
  'playedLastSeason',
  'remark',
  'feeAgreed',
];

export default function RegisterPage() {
  const [passcode, setPasscode] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState<{ name: string; imageUrl: string } | null>(null);

  useEffect(() => {
    try {
      setPasscode(sessionStorage.getItem(PASS_KEY));
    } catch {}
    setReady(true);
  }, []);

  const unlock = (value: string) => {
    setPasscode(value);
    try {
      sessionStorage.setItem(PASS_KEY, value);
    } catch {}
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-4xl font-black uppercase leading-[0.9] tracking-wide text-ink sm:text-5xl">
          Player registration
        </h1>
        <p className="mt-3 font-display text-lg font-bold uppercase tracking-[0.14em] text-cream">
          {SEASON.short} Season {SEASON.season} · Auction {SEASON.auctionDate}
        </p>

        {!ready ? null : !passcode ? (
          <PasscodeGate onUnlock={unlock} />
        ) : done ? (
          <Registered
            name={done.name}
            imageUrl={done.imageUrl}
            onAnother={() => {
              setDone(null);
              window.scrollTo({ top: 0 });
            }}
          />
        ) : (
          <RegistrationForm
            passcode={passcode}
            onLocked={() => {
              setPasscode(null);
              try {
                sessionStorage.removeItem(PASS_KEY);
              } catch {}
            }}
            onDone={(name, imageUrl) => {
              setDone({ name, imageUrl });
              window.scrollTo({ top: 0 });
            }}
          />
        )}
      </div>
    </AppShell>
  );
}

function PasscodeGate({ onUnlock }: { onUnlock: (value: string) => void }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) {
      setError('Enter the password shared in the society group.');
      return;
    }
    setChecking(true);
    try {
      const res = await fetch('/api/register/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: value }),
      });
      if (res.ok) onUnlock(value.trim());
      else setError('That password isn’t right. Check the message from the organisers.');
    } catch {
      setError('Couldn’t check the password. Check your connection and try again.');
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-8 rounded-md border border-rule-strong bg-night-2 p-5 sm:p-7">
      <div className="flex items-start gap-3">
        <Lock className="mt-0.5 h-5 w-5 shrink-0 text-cream" aria-hidden />
        <p className="text-[15px] text-ink-2">
          Registration is for Samriddhi residents. Enter the password from the organisers to open the form.
        </p>
      </div>
      <Field id="reg-pass" label="Registration password" error={error} className="mt-5">
        <Input
          id="reg-pass"
          autoFocus
          autoComplete="off"
          autoCapitalize="characters"
          value={value}
          aria-invalid={!!error}
          aria-describedby={error ? 'reg-pass-error' : undefined}
          onChange={e => {
            setValue(e.target.value);
            setError(null);
          }}
        />
      </Field>
      <Button type="submit" variant="primary" size="lg" className="mt-5 w-full sm:w-auto" disabled={checking}>
        {checking && <Loader2 className="animate-spin" />}
        Open the form
      </Button>
    </form>
  );
}

function RegistrationForm({
  passcode,
  onLocked,
  onDone,
}: {
  passcode: string;
  onLocked: () => void;
  onDone: (name: string, imageUrl: string) => void;
}) {
  const [form, setForm] = useState<RegistrationInput>(EMPTY_REGISTRATION);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [banner, setBanner] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const set = <K extends keyof RegistrationInput>(key: K, value: RegistrationInput[K]) => {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(({ [key]: _, ...rest }) => rest);
  };

  const focusFirstError = (errs: RegistrationErrors) => {
    const first = FIELD_ORDER.find(k => errs[k]);
    if (!first) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.querySelector<HTMLElement>('input, select, textarea, button')?.focus({ preventScroll: true });
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);
    const errs = validateRegistration(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      setBanner('A few answers need fixing. They’re marked below.');
      focusFirstError(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, passcode }),
      });
      const data = await res.json();
      if (res.status === 401) {
        onLocked();
        return;
      }
      if (!data.success) {
        setBanner(data.error);
        if (data.fields) {
          setErrors(data.fields);
          focusFirstError(data.fields);
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        return;
      }
      onDone(form.name.trim(), form.imageUrl);
      setForm(EMPTY_REGISTRATION);
    } catch {
      setBanner('We couldn’t send your registration. Check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const age = /^\d{4}-\d{2}-\d{2}$/.test(form.dateOfBirth) ? ageOn(form.dateOfBirth) : null;
  const err = (k: keyof RegistrationInput) => errors[k] ?? null;
  const described = (id: string, k: keyof RegistrationInput) => ({
    'aria-invalid': !!errors[k],
    'aria-describedby': errors[k] ? `${id}-error` : undefined,
  });

  return (
    <form ref={formRef} onSubmit={submit} noValidate className="mt-8">
      {banner && (
        <p role="alert" className="mb-6 rounded-md border border-ball/70 bg-ball/10 px-4 py-3 text-[15px] text-ink">
          {banner}
        </p>
      )}

      <Section n={1} title="Personal details">
        <div data-field="name">
          <Field id="r-name" label="Full name" error={err('name')}>
            <Input
              id="r-name"
              autoComplete="name"
              autoCapitalize="words"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              {...described('r-name', 'name')}
            />
          </Field>
        </div>
        <div data-field="mobileNumber">
          <Field id="r-mobile" label="Mobile number" error={err('mobileNumber')} hint="One registration per mobile number.">
            <Input
              id="r-mobile"
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="10-digit number"
              value={form.mobileNumber}
              onChange={e => set('mobileNumber', e.target.value)}
              {...described('r-mobile', 'mobileNumber')}
            />
          </Field>
        </div>
        <div data-field="wing">
          <Choice
            name="wing"
            legend="Wing"
            options={SOCIETY.wings.map(w => ({ value: w, label: w.replace('-Wing', ' Wing') }))}
            value={form.wing}
            onChange={v => set('wing', v)}
            error={err('wing')}
            columns={4}
          />
        </div>
        <div data-field="flatNumber">
          <Field id="r-flat" label="Flat number" error={err('flatNumber')}>
            <Select
              id="r-flat"
              value={form.flatNumber}
              onChange={e => set('flatNumber', e.target.value)}
              {...described('r-flat', 'flatNumber')}
            >
              <option value="">Choose your flat</option>
              {flatsByFloor().map(({ floor, flats }) => (
                <optgroup key={floor} label={`Floor ${floor}`}>
                  {flats.map(f => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </optgroup>
              ))}
            </Select>
          </Field>
        </div>
        <div data-field="dateOfBirth">
          <Field
            id="r-dob"
            label="Date of birth"
            error={err('dateOfBirth')}
            hint={age !== null && age > 0 ? `You’ll be ${age} on auction day.` : undefined}
          >
            <DateOfBirthSelect
              id="r-dob"
              value={form.dateOfBirth}
              onChange={v => set('dateOfBirth', v)}
              fromYear={SEASON.year - REGISTRATION.maxAge}
              toYear={SEASON.year - REGISTRATION.minAge}
              invalid={!!errors.dateOfBirth}
              describedBy={errors.dateOfBirth ? 'r-dob-error' : undefined}
            />
          </Field>
        </div>
      </Section>

      <Section n={2} title="Playing profile">
        <div data-field="imageUrl">
          <PhotoField
            name={form.name}
            value={form.imageUrl}
            onChange={url => set('imageUrl', url)}
            error={err('imageUrl')}
          />
        </div>
        <div data-field="playingRole">
          <Choice
            name="playingRole"
            legend="Playing role"
            options={PLAYING_ROLES.map(r => ({ value: r, label: r }))}
            value={form.playingRole}
            onChange={v => set('playingRole', v as RegistrationInput['playingRole'])}
            error={err('playingRole')}
            columns={3}
          />
        </div>
        <div data-field="battingStyle">
          <Choice
            name="battingStyle"
            legend="Batting"
            options={[
              { value: 'Left', label: 'Left hand' },
              { value: 'Right', label: 'Right hand' },
            ]}
            value={form.battingStyle}
            onChange={v => set('battingStyle', v as RegistrationInput['battingStyle'])}
            error={err('battingStyle')}
            columns={2}
          />
        </div>
        <div data-field="bowlingStyle">
          <Choice
            name="bowlingStyle"
            legend="Bowling"
            options={(['Left', 'Right', 'None'] as const).map(v => ({ value: v, label: BOWLING_LABEL[v] }))}
            value={form.bowlingStyle}
            onChange={v => set('bowlingStyle', v as RegistrationInput['bowlingStyle'])}
            error={err('bowlingStyle')}
            columns={3}
          />
        </div>
      </Section>

      <Section n={3} title="Team T-shirt">
        <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_11rem] sm:items-start">
          <div className="grid gap-6">
            <div data-field="tshirtSize">
              <Choice
                name="tshirtSize"
                legend="Size"
                options={REGISTRATION.tshirtSizes.map(s => ({ value: s, label: s }))}
                value={form.tshirtSize}
                onChange={v => set('tshirtSize', v)}
                error={err('tshirtSize')}
                columns={5}
              />
            </div>
            {form.tshirtSize === 'Other' && (
              <div data-field="tshirtSizeOther">
                <Field id="r-size-other" label="Which size?" error={err('tshirtSizeOther')}>
                  <Input
                    id="r-size-other"
                    placeholder="e.g. 5XL, or chest 46 in"
                    value={form.tshirtSizeOther}
                    onChange={e => set('tshirtSizeOther', e.target.value)}
                    {...described('r-size-other', 'tshirtSizeOther')}
                  />
                </Field>
              </div>
            )}
            <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-4">
              <div data-field="tshirtName">
                <Field id="r-shirt-name" label="Name on back" error={err('tshirtName')}>
                  <Input
                    id="r-shirt-name"
                    maxLength={12}
                    autoCapitalize="characters"
                    value={form.tshirtName}
                    onChange={e => set('tshirtName', e.target.value.toUpperCase())}
                    {...described('r-shirt-name', 'tshirtName')}
                  />
                </Field>
              </div>
              <div data-field="tshirtNumber">
                <Field id="r-shirt-no" label="Number" error={err('tshirtNumber')}>
                  <Input
                    id="r-shirt-no"
                    inputMode="numeric"
                    maxLength={3}
                    value={form.tshirtNumber}
                    onChange={e => set('tshirtNumber', e.target.value.replace(/\D/g, ''))}
                    {...described('r-shirt-no', 'tshirtNumber')}
                  />
                </Field>
              </div>
            </div>
          </div>
          <JerseyPreview name={form.tshirtName} number={form.tshirtNumber} />
        </div>
      </Section>

      <Section n={4} title={`Last season (${SEASON.short}-${SEASON.season - 1})`}>
        <div data-field="playedLastSeason">
          <Choice
            name="playedLastSeason"
            legend={`Did you play in ${SEASON.short} Season ${SEASON.season - 1}?`}
            options={(['YES', 'NO', 'NOT_SURE'] as const).map(v => ({ value: v, label: PLAYED_LABEL[v] }))}
            value={form.playedLastSeason}
            onChange={v => set('playedLastSeason', v as RegistrationInput['playedLastSeason'])}
            error={err('playedLastSeason')}
            columns={3}
          />
        </div>
        <div data-field="remark">
          <Field id="r-remark" label="Remark (optional)" error={err('remark')} hint="Anything the organisers should know.">
            <textarea
              id="r-remark"
              rows={3}
              maxLength={200}
              value={form.remark}
              onChange={e => set('remark', e.target.value)}
              className="w-full rounded border border-rule-strong bg-night px-3 py-2.5 text-[15px] text-ink placeholder:text-ink-3 hover:border-ink-3 focus-visible:border-cream focus-visible:outline-none"
            />
          </Field>
        </div>
      </Section>

      <div data-field="feeAgreed" className="mt-10 border-t border-rule-strong pt-8">
        <label
          className={cn(
            'flex cursor-pointer items-start gap-3 rounded-md border bg-night-2 p-4 text-[15px] text-ink',
            errors.feeAgreed ? 'border-ball' : 'border-rule-strong',
          )}
        >
          <input
            type="checkbox"
            checked={form.feeAgreed}
            onChange={e => set('feeAgreed', e.target.checked)}
            aria-describedby={errors.feeAgreed ? 'r-fee-error' : undefined}
            className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--floodlight)]"
          />
          <span>
            I agree to pay the registration fee of{' '}
            <span className="tabular font-semibold text-cream">{FEE}</span>
            {' '}upon confirmation of my selection.
          </span>
        </label>
        {errors.feeAgreed && (
          <p id="r-fee-error" className="mt-1.5 text-sm text-[#ff8a90]">
            {errors.feeAgreed}
          </p>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button type="submit" variant="primary" size="lg" className="w-full sm:w-auto" disabled={submitting}>
          {submitting && <Loader2 className="animate-spin" />}
          Submit registration
        </Button>
        <p className="text-sm text-ink-3">The organisers review every registration before the auction.</p>
      </div>
    </form>
  );
}

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10 border-t border-rule-strong pt-6 first:mt-0" aria-labelledby={`sec-${n}`}>
      <h2 id={`sec-${n}`} className="flex items-baseline gap-3 font-display text-2xl font-extrabold uppercase tracking-wide text-ink">
        <span className="tabular text-cream">{n}</span>
        {title}
      </h2>
      <div className="mt-5 grid gap-6">{children}</div>
    </section>
  );
}

/** Radio buttons drawn as chips; native radios keep arrow-key behaviour. */
function Choice({
  name,
  legend,
  options,
  value,
  onChange,
  error,
  columns,
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  error: string | null;
  columns: number;
}) {
  return (
    <fieldset aria-describedby={error ? `${name}-error` : undefined}>
      <legend className="mb-1.5 text-sm font-semibold text-ink-2">{legend}</legend>
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      >
        {options.map(o => {
          const on = value === o.value;
          return (
            <label
              key={o.value}
              className={cn(
                'flex h-11 cursor-pointer items-center justify-center rounded border px-1.5 text-center text-[15px] font-semibold leading-tight transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-cream',
                on
                  ? 'border-floodlight bg-floodlight text-white'
                  : error
                    ? 'border-ball/70 text-ink-2 hover:text-ink'
                    : 'border-rule-strong text-ink-2 hover:border-ink-3 hover:text-ink',
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={on}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              {o.label}
            </label>
          );
        })}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-sm text-[#ff8a90]">
          {error}
        </p>
      )}
    </fieldset>
  );
}

const PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

/**
 * Re-encodes the photo as a JPEG of at most 1200px, so phone photos stay well
 * under the server's size limit. Returns null when the browser can't read it
 * as a photo (an SVG, a PDF renamed .jpg, an unsupported HEIC).
 */
async function toJpeg(file: File): Promise<Blob | null> {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 1200 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob | null>(r => canvas.toBlob(r, 'image/jpeg', 0.85));
  } catch {
    return null;
  }
}

function PhotoField({
  name,
  value,
  onChange,
  error,
}: {
  name: string;
  value: string;
  onChange: (url: string) => void;
  error: string | null;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!PHOTO_TYPES.includes(file.type)) {
      setUploadError('Choose a photo from your camera or gallery (JPG or PNG).');
      return;
    }
    setUploading(true);
    setUploadError(null);
    try {
      const body = await toJpeg(file);
      if (!body) {
        setUploadError('This photo couldn’t be read. Take a screenshot of it, or pick another photo.');
        return;
      }
      const slug = (name.trim() || 'player').replace(/[^\w]+/g, '-').toLowerCase();
      const res = await fetch(`/api/blob?filename=${encodeURIComponent(`registrations/${slug}.jpg`)}`, {
        method: 'POST',
        body,
      });
      const data = await res.json();
      if (!data.url) throw new Error('no url');
      onChange(data.url);
    } catch {
      setUploadError('The photo didn’t upload. Try again, or pick a smaller photo.');
    } finally {
      setUploading(false);
    }
  };

  const shown = uploadError ?? error;
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-ink-2" id="photo-label">
        Your photo
      </p>
      <div className="flex items-center gap-4">
        <div
          className={cn(
            'relative flex h-32 w-[6.5rem] shrink-0 items-center justify-center overflow-hidden rounded border bg-night-3',
            shown ? 'border-ball' : 'border-rule-strong',
          )}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="Your photo" className="h-full w-full object-cover object-top" />
          ) : (
            <Camera className="h-7 w-7 text-ink-3" aria-hidden />
          )}
          {uploading && (
            <span className="absolute inset-0 flex items-center justify-center bg-night/70">
              <Loader2 className="h-6 w-6 animate-spin text-ink" aria-label="Uploading" />
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm text-ink-3">
            A clear face photo, shoulders up. It’s shown on the big screen when you’re called.
          </p>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={pick} className="sr-only" aria-labelledby="photo-label" tabIndex={-1} />
          <Button className="mt-3" onClick={() => inputRef.current?.click()} disabled={uploading}>
            {value ? <RotateCcw /> : <Camera />}
            {value ? 'Change photo' : 'Add photo'}
          </Button>
        </div>
      </div>
      {shown && <p className="mt-1.5 text-sm text-[#ff8a90]">{shown}</p>}
    </div>
  );
}

function JerseyPreview({ name, number }: { name: string; number: string }) {
  return (
    <figure className="mx-auto w-40 sm:w-full" aria-label="T-shirt preview">
      <svg viewBox="0 0 200 210" className="w-full drop-shadow-[0_18px_30px_rgba(0,0,0,0.5)]">
        <path
          d="M62 12 L28 26 L4 70 L36 88 L46 70 L46 200 L154 200 L154 70 L164 88 L196 70 L172 26 L138 12 Q100 30 62 12 Z"
          fill="var(--floodlight)"
          stroke="rgba(255,255,255,0.25)"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path d="M62 12 Q100 30 138 12" fill="none" stroke="var(--night)" strokeWidth="6" />
        <text
          x="100"
          y="70"
          textAnchor="middle"
          fill="#fff"
          fontSize="17"
          fontWeight="700"
          letterSpacing="1.5"
          style={{ fontFamily: 'var(--font-display)' }}
          textLength={name.length > 8 ? 92 : undefined}
          lengthAdjust="spacingAndGlyphs"
        >
          {name || 'YOUR NAME'}
        </text>
        <text
          x="100"
          y="156"
          textAnchor="middle"
          fill="#fff"
          fontSize="76"
          fontWeight="900"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {number || '00'}
        </text>
      </svg>
      <figcaption className="mt-2 text-center text-xs text-ink-3">How the back will read</figcaption>
    </figure>
  );
}

function Registered({
  name,
  imageUrl,
  onAnother,
}: {
  name: string;
  imageUrl: string;
  onAnother: () => void;
}) {
  return (
    <div className="mt-8 rounded-md border border-rule-strong bg-night-2 p-6 sm:p-8" role="status">
      <div className="flex items-center gap-5">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="h-28 w-[5.5rem] shrink-0 rounded object-cover object-top ring-1 ring-rule-strong" />
        <div>
          <p className="flex items-center gap-2 text-turf">
            <CheckCircle2 className="h-5 w-5" aria-hidden />
            <span className="font-semibold">Registration received</span>
          </p>
          <p className="mt-1 font-display text-3xl font-black uppercase leading-none tracking-wide text-ink">
            {titleCase(name)}
          </p>
        </div>
      </div>
      <p className="mt-6 text-[15px] text-ink-2">
        The organisers will review it and add you to the auction pool. The {FEE} fee
        is due only once your selection is confirmed. See you on {SEASON.auctionDate}.
      </p>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button onClick={onAnother}>Register another player</Button>
        <Link href="/" className="inline-flex h-11 items-center px-3 text-[15px] font-semibold text-ink-2 hover:text-ink">
          Back to home
        </Link>
      </div>
    </div>
  );
}
