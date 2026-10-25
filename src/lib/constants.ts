import { AuctionRules, PlayerCategory } from "@/types";

// Season data — change these each season.
export const SEASON = {
  league: "Samriddhi Champions League",
  short: "SCL",
  season: 7,
  year: 2027,
  auctionDate: "17 Jan 2027",
  // ISO auction day; ages on the registration form are worked out as of this date
  auctionDay: "2027-01-17",
  // As printed on the season emblem
  emblemDate: "17th Jan, 2027",
};

// The society's buildings, as used by the registration form
export const SOCIETY = {
  wings: ["A-Wing", "B-Wing", "C-Wing", "D-Wing"],
  floors: 20,
  flatsPerFloor: 8,
};

export const REGISTRATION = {
  fee: 1000,
  tshirtSizes: ["XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL", "Other"],
  minAge: 8,
  maxAge: 80,
};

export const AUCTION_RULES: AuctionRules = {
  totalTeams: 7,
  teamPurse: 20000000, // 2 crore in rupees
  minPlayers: 13,
  maxPlayers: 13,
  categoryLimits: {
    LEGEND: { min: 1, max: 1 },
    YOUNGSTAR: { min: 1, max: 1 },
    GOLD: { min: 2, max: 2 }, // Required: exactly 2
    SILVER: { min: 5, max: 5 }, // Required: exactly 5
    BRONZE: { min: 4, max: 13 - 1 - 1 - 2 - 5 }, // Min 4, max 4 (13-1-1-2-5=4)
  },
  minBidAmount: {
    LEGEND: 500000, // 5 lakh
    YOUNGSTAR: 500000, // 5 lakh
    GOLD: 1500000, // 15 lakh
    SILVER: 1000000, // 10 lakh
    BRONZE: 500000, // 5 lakh
  },
};

export const TEAM_NAMES = [
  "GUJARAT LIONS",
  "CHHAVA SENA",
  "TEAM LAGAAN",
  "PRATHAM 11",
  "YOHAN'S WARRIORS",
  "KHALSA WARRIORS",
  "SHREE SIDDHIVINAYAK STRIKERS",
];

/** Squad order, top to bottom, used everywhere categories are listed. */
export const CATEGORY_ORDER: PlayerCategory[] = [
  "LEGEND",
  "YOUNGSTAR",
  "GOLD",
  "SILVER",
  "BRONZE",
];

/**
 * Category identity. `ink` is the category colour (text on night / fill behind
 * night text); `wash` is the same colour at low strength for filled squad lines.
 */
export const CATEGORY_META: Record<
  PlayerCategory,
  { label: string; ink: string; wash: string; text: string; fill: string }
> = {
  LEGEND: {
    label: "Legend",
    ink: "var(--cat-legend)",
    wash: "rgba(255, 90, 168, 0.16)",
    text: "text-cat-legend",
    fill: "bg-cat-legend",
  },
  YOUNGSTAR: {
    label: "Youngstar",
    ink: "var(--cat-youngstar)",
    wash: "rgba(126, 217, 87, 0.14)",
    text: "text-cat-youngstar",
    fill: "bg-cat-youngstar",
  },
  GOLD: {
    label: "Gold",
    ink: "var(--cat-gold)",
    wash: "rgba(245, 197, 66, 0.15)",
    text: "text-cat-gold",
    fill: "bg-cat-gold",
  },
  SILVER: {
    label: "Silver",
    ink: "var(--cat-silver)",
    wash: "rgba(195, 204, 232, 0.13)",
    text: "text-cat-silver",
    fill: "bg-cat-silver",
  },
  BRONZE: {
    label: "Bronze",
    ink: "var(--cat-bronze)",
    wash: "rgba(255, 138, 61, 0.15)",
    text: "text-cat-bronze",
    fill: "bg-cat-bronze",
  },
};
