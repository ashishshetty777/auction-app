export type PlayerCategory = "LEGEND" | "YOUNGSTAR" | "GOLD" | "SILVER" | "BRONZE";

export type PlayingRole = "Batsman" | "Bowler" | "Allrounder";

export interface Player {
  id: string;
  name: string;
  mobileNumber: string;
  playingRole: PlayingRole;
  wing: string;
  flatNumber: string;
  dateOfBirth: string;
  age: number;
  category: PlayerCategory;
  teamId?: string;
  soldAmount?: number;
}

export interface Team {
  id: string;
  name: string;
  purse: number;
  remainingPurse: number;
  players: Player[];
  categoryCount: {
    LEGEND: number;
    YOUNGSTAR: number;
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };
}

export interface AuctionRules {
  totalTeams: number;
  teamPurse: number;
  minPlayers: number;
  maxPlayers: number;
  categoryLimits: {
    LEGEND: { min: number; max: number };
    YOUNGSTAR: { min: number; max: number };
    GOLD: { min: number; max: number };
    SILVER: { min: number; max: number };
    BRONZE: { min: number; max: number };
  };
  minBidAmount: {
    LEGEND: number;
    YOUNGSTAR: number;
    GOLD: number;
    SILVER: number;
    BRONZE: number;
  };
}

export interface CurrentAuction {
  playerId: string | null;
  currentBid: number;
  biddingTeamId: string | null;
}
