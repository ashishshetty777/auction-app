import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Player } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function sortPlayersByName(players: Player[]): Player[] {
  return [...players].sort((a, b) => a.name.localeCompare(b.name));
}
