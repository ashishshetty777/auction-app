import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortPlayersByName(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.name.localeCompare(b.name));
}

const trim = (n: number, digits: number) =>
  Number(n.toFixed(digits)).toString();

/** Indian auction money: ₹42 L, ₹1.25 Cr. No trailing ".0". */
export function formatMoney(amount: number): string {
  if (amount >= 10000000) return `₹${trim(amount / 10000000, 2)} Cr`;
  return `₹${trim(amount / 100000, 1)} L`;
}

/** Title-case a stored upper-case name for running text: "KHALSA WARRIORS" → "Khalsa Warriors". */
export function titleCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/(^|[\s-])(\p{L})/gu, (_, sep, ch) => sep + ch.toUpperCase());
}

/** Scorebook form for tight columns: "Dr Dattatraya Chaudhari" → "D. Chaudhari". */
export function scorebookName(value: string): string {
  const parts = titleCase(value).replace(/^Dr\.?\s+/i, '').split(/\s+/).filter(Boolean);
  if (parts.length < 2) return parts[0] ?? '';
  return `${parts[0][0]}. ${parts[parts.length - 1]}`;
}
