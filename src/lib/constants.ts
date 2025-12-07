import { AuctionRules } from "@/types";

export const AUCTION_RULES: AuctionRules = {
  totalTeams: 7,
  teamPurse: 20000000, // 2 crore in rupees
  minPlayers: 11,
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

export const CATEGORY_COLORS: Record<string, string> = {
  LEGEND: "bg-purple-100 text-purple-800 border-purple-300",
  YOUNGSTAR: "bg-green-100 text-green-800 border-green-300",
  GOLD: "bg-yellow-100 text-yellow-800 border-yellow-300",
  SILVER: "bg-gray-100 text-gray-800 border-gray-300",
  BRONZE: "bg-orange-100 text-orange-800 border-orange-300",
};

export const CATEGORY_BG_COLORS: Record<string, string> = {
  LEGEND: "bg-purple-500",
  YOUNGSTAR: "bg-green-500",
  GOLD: "bg-yellow-400",
  SILVER: "bg-gray-400",
  BRONZE: "bg-orange-500",
};

export const CATEGORY_BG_COLORS_HEX: Record<string, string> = {
  LEGEND: "#a855f7",
  YOUNGSTAR: "#22c55e",
  GOLD: "#fbbf24",
  SILVER: "#9ca3af",
  BRONZE: "#f97316",
};

export const CATEGORY_TEXT_COLORS: Record<string, string> = {
  LEGEND: "text-white",
  YOUNGSTAR: "text-white",
  GOLD: "text-gray-900",
  SILVER: "text-white",
  BRONZE: "text-white",
};

export const CATEGORY_TEXT_COLORS_HEX: Record<string, string> = {
  LEGEND: "#ffffff",
  YOUNGSTAR: "#ffffff",
  GOLD: "#111827",
  SILVER: "#ffffff",
  BRONZE: "#ffffff",
};
