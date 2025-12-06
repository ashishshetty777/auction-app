"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Player, Team, CurrentAuction } from "@/types";
import { PLAYERS_DATA } from "./players-data";
import { TEAM_NAMES, AUCTION_RULES } from "./constants";

interface AuctionContextType {
  players: Player[];
  teams: Team[];
  currentAuction: CurrentAuction;
  addPlayer: (player: Omit<Player, "id">) => void;
  removePlayer: (playerId: string) => void;
  updatePlayer: (playerId: string, updates: Partial<Player>) => void;
  setCurrentAuctionPlayer: (playerId: string | null) => void;
  addPlayerToTeam: (playerId: string, teamId: string, amount: number) => boolean;
  getMaxBid: (teamId: string, category: Player["category"]) => number;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentAuction, setCurrentAuction] = useState<CurrentAuction>({
    playerId: null,
    currentBid: 0,
    biddingTeamId: null,
  });

  useEffect(() => {
    const storedPlayers = localStorage.getItem("auction-players");
    const storedTeams = localStorage.getItem("auction-teams");

    if (storedPlayers) {
      setPlayers(JSON.parse(storedPlayers));
    } else {
      setPlayers(PLAYERS_DATA);
      localStorage.setItem("auction-players", JSON.stringify(PLAYERS_DATA));
    }

    if (storedTeams) {
      setTeams(JSON.parse(storedTeams));
    } else {
      const initialTeams: Team[] = TEAM_NAMES.map((name, index) => ({
        id: `team-${index + 1}`,
        name,
        purse: AUCTION_RULES.teamPurse,
        remainingPurse: AUCTION_RULES.teamPurse,
        players: [],
        categoryCount: {
          LEGEND: 0,
          YOUNGSTAR: 0,
          GOLD: 0,
          SILVER: 0,
          BRONZE: 0,
        },
      }));
      setTeams(initialTeams);
      localStorage.setItem("auction-teams", JSON.stringify(initialTeams));
    }
  }, []);

  useEffect(() => {
    if (players.length > 0) {
      localStorage.setItem("auction-players", JSON.stringify(players));
    }
  }, [players]);

  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem("auction-teams", JSON.stringify(teams));
    }
  }, [teams]);

  const addPlayer = (player: Omit<Player, "id">) => {
    const newPlayer: Player = {
      ...player,
      id: `player-${Date.now()}`,
    };
    setPlayers([...players, newPlayer]);
  };

  const removePlayer = (playerId: string) => {
    setPlayers(players.filter((p) => p.id !== playerId));
  };

  const updatePlayer = (playerId: string, updates: Partial<Player>) => {
    setPlayers(
      players.map((p) => (p.id === playerId ? { ...p, ...updates } : p))
    );
  };

  const setCurrentAuctionPlayer = (playerId: string | null) => {
    const player = playerId ? players.find((p) => p.id === playerId) : null;
    setCurrentAuction({
      playerId,
      currentBid: player ? AUCTION_RULES.minBidAmount[player.category] : 0,
      biddingTeamId: null,
    });
  };

  const getMaxBid = (teamId: string, category: Player["category"]): number => {
    const team = teams.find((t) => t.id === teamId);
    if (!team) return 0;

    const totalPlayers = team.players.length;
    const categoryCount = team.categoryCount[category];
    const categoryLimit = AUCTION_RULES.categoryLimits[category];

    if (categoryCount >= categoryLimit.max) return 0;

    if (totalPlayers >= AUCTION_RULES.maxPlayers) return 0;

    const minPlayersNeeded = AUCTION_RULES.minPlayers - totalPlayers;
    const minBudgetNeeded = minPlayersNeeded * AUCTION_RULES.minBidAmount.BRONZE;

    const availableForThisPlayer = team.remainingPurse - minBudgetNeeded;

    return Math.max(0, availableForThisPlayer);
  };

  const addPlayerToTeam = (
    playerId: string,
    teamId: string,
    amount: number
  ): boolean => {
    const player = players.find((p) => p.id === playerId);
    const team = teams.find((t) => t.id === teamId);

    if (!player || !team) return false;

    if (player.teamId) return false;

    if (amount < AUCTION_RULES.minBidAmount[player.category]) return false;

    const maxBid = getMaxBid(teamId, player.category);
    if (amount > maxBid) return false;

    const updatedPlayer = { ...player, teamId, soldAmount: amount };
    setPlayers(
      players.map((p) => (p.id === playerId ? updatedPlayer : p))
    );

    setTeams(
      teams.map((t) => {
        if (t.id === teamId) {
          return {
            ...t,
            players: [...t.players, updatedPlayer],
            remainingPurse: t.remainingPurse - amount,
            categoryCount: {
              ...t.categoryCount,
              [player.category]: t.categoryCount[player.category] + 1,
            },
          };
        }
        return t;
      })
    );

    setCurrentAuction({
      playerId: null,
      currentBid: 0,
      biddingTeamId: null,
    });

    return true;
  };

  return (
    <AuctionContext.Provider
      value={{
        players,
        teams,
        currentAuction,
        addPlayer,
        removePlayer,
        updatePlayer,
        setCurrentAuctionPlayer,
        addPlayerToTeam,
        getMaxBid,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error("useAuction must be used within an AuctionProvider");
  }
  return context;
}
