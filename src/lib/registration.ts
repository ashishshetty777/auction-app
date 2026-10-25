import { REGISTRATION, SEASON, SOCIETY } from './constants';
import { PlayingRole } from '@/types';

export type Hand = 'Left' | 'Right';
export type BowlingStyle = 'Left' | 'Right' | 'None';
export type PlayedLastSeason = 'YES' | 'NO' | 'NOT_SURE';
export type RegistrationStatus = 'PENDING' | 'ADDED';

export const PLAYING_ROLES: PlayingRole[] = ['Batsman', 'Bowler', 'Allrounder'];

export interface RegistrationInput {
  name: string;
  mobileNumber: string;
  wing: string;
  flatNumber: string;
  /** yyyy-mm-dd, as a date input gives it */
  dateOfBirth: string;
  imageUrl: string;
  playingRole: PlayingRole | '';
  battingStyle: Hand | '';
  bowlingStyle: BowlingStyle | '';
  tshirtSize: string;
  tshirtSizeOther: string;
  tshirtName: string;
  tshirtNumber: string;
  playedLastSeason: PlayedLastSeason | '';
  remark: string;
  feeAgreed: boolean;
}

export interface Registration {
  id: string;
  status: RegistrationStatus;
  playerId?: string;
  name: string;
  mobileNumber: string;
  wing: string;
  flatNumber: string;
  /** dd-mm-yyyy, matching player records */
  dateOfBirth: string;
  age: number;
  imageUrl: string;
  playingRole: PlayingRole;
  battingStyle: Hand;
  bowlingStyle: BowlingStyle;
  tshirtSize: string;
  tshirtName: string;
  tshirtNumber: string;
  playedLastSeason: PlayedLastSeason;
  remark?: string;
  createdAt: string;
}

export const EMPTY_REGISTRATION: RegistrationInput = {
  name: '',
  mobileNumber: '',
  wing: '',
  flatNumber: '',
  dateOfBirth: '',
  imageUrl: '',
  playingRole: '',
  battingStyle: '',
  bowlingStyle: '',
  tshirtSize: '',
  tshirtSizeOther: '',
  tshirtName: '',
  tshirtNumber: '',
  playedLastSeason: '',
  remark: '',
  feeAgreed: false,
};

export const BOWLING_LABEL: Record<BowlingStyle, string> = {
  Left: 'Left arm',
  Right: 'Right arm',
  None: 'Doesn’t bowl',
};

export const PLAYED_LABEL: Record<PlayedLastSeason, string> = {
  YES: 'Yes',
  NO: 'No',
  NOT_SURE: 'Not sure',
};

/** Flats in a wing, grouped by floor: 101–108 … 2001–2008. */
export function flatsByFloor(): { floor: number; flats: string[] }[] {
  return Array.from({ length: SOCIETY.floors }, (_, i) => {
    const floor = i + 1;
    return {
      floor,
      flats: Array.from(
        { length: SOCIETY.flatsPerFloor },
        (_, j) => `${floor}${String(j + 1).padStart(2, '0')}`,
      ),
    };
  });
}

/** Last 10 digits of an Indian mobile number, so "+91 98024 41730" and "9802441730" match. */
export function normalizeMobile(value: string): string {
  const digits = value.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** Name for duplicate matching: case, spacing, dots and a leading "Dr" ignored. */
export function nameKey(value: string): string {
  return value
    .toLowerCase()
    .replace(/\./g, ' ')
    .replace(/^\s*dr\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function ageOn(dobIso: string, onIso: string = SEASON.auctionDay): number {
  const dob = new Date(`${dobIso}T00:00:00`);
  const on = new Date(`${onIso}T00:00:00`);
  let age = on.getFullYear() - dob.getFullYear();
  const beforeBirthday =
    on.getMonth() < dob.getMonth() ||
    (on.getMonth() === dob.getMonth() && on.getDate() < dob.getDate());
  if (beforeBirthday) age -= 1;
  return age;
}

/** yyyy-mm-dd → dd-mm-yyyy */
export function toStoredDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
}

export type RegistrationErrors = Partial<Record<keyof RegistrationInput, string>>;

/** Shared by the form and the API, so both refuse the same things. */
export function validateRegistration(input: RegistrationInput): RegistrationErrors {
  const e: RegistrationErrors = {};
  const name = input.name.trim();
  if (name.length < 3) e.name = 'Enter your full name.';
  else if (name.length > 60) e.name = 'Keep the name under 60 characters.';

  const mobile = normalizeMobile(input.mobileNumber);
  if (!/^[6-9]\d{9}$/.test(mobile)) e.mobileNumber = 'Enter a 10-digit mobile number.';

  if (!SOCIETY.wings.includes(input.wing)) e.wing = 'Choose your wing.';
  const validFlats = flatsByFloor().flatMap(f => f.flats);
  if (!validFlats.includes(input.flatNumber)) e.flatNumber = 'Choose your flat.';

  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth) || isNaN(Date.parse(input.dateOfBirth))) {
    e.dateOfBirth = 'Enter your date of birth.';
  } else {
    const age = ageOn(input.dateOfBirth);
    if (age < REGISTRATION.minAge || age > REGISTRATION.maxAge) {
      e.dateOfBirth = `Check the year: that makes you ${age} on auction day.`;
    }
  }

  if (!input.imageUrl) e.imageUrl = 'Add a photo so the owners know who you are.';
  if (!PLAYING_ROLES.includes(input.playingRole as PlayingRole)) e.playingRole = 'Choose your playing role.';
  if (!['Left', 'Right'].includes(input.battingStyle)) e.battingStyle = 'Choose your batting hand.';
  if (!['Left', 'Right', 'None'].includes(input.bowlingStyle)) e.bowlingStyle = 'Choose your bowling arm.';

  if (!REGISTRATION.tshirtSizes.includes(input.tshirtSize)) e.tshirtSize = 'Choose a T-shirt size.';
  else if (input.tshirtSize === 'Other' && !input.tshirtSizeOther.trim()) {
    e.tshirtSizeOther = 'Tell us the size you need.';
  }
  const shirtName = input.tshirtName.trim();
  if (!shirtName) e.tshirtName = 'Enter the name for your T-shirt.';
  else if (shirtName.length > 12) e.tshirtName = 'Up to 12 letters fit on the back.';
  if (!/^\d{1,3}$/.test(input.tshirtNumber.trim())) e.tshirtNumber = 'Enter a number from 0 to 999.';

  if (!['YES', 'NO', 'NOT_SURE'].includes(input.playedLastSeason)) {
    e.playedLastSeason = 'Let us know if you played last season.';
  }
  if (input.remark.length > 200) e.remark = 'Keep the remark under 200 characters.';
  if (!input.feeAgreed) e.feeAgreed = 'Tick the box to agree to the registration fee.';
  return e;
}
