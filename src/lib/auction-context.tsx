'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Player, Team, CurrentAuction, LastSale } from '@/types';
import { AUCTION_RULES } from './constants';

interface AuctionContextType {
  players: Player[];
  teams: Team[];
  currentAuction: CurrentAuction;
  loading: boolean;
  addPlayer: (player: Omit<Player, 'id'>) => Promise<void>;
  removePlayer: (playerId: string) => Promise<void>;
  updatePlayer: (playerId: string, updates: Partial<Player>) => Promise<void>;
  setCurrentAuctionPlayer: (playerId: string | null) => void;
  addPlayerToTeam: (
    playerId: string,
    teamId: string,
    amount: number,
  ) => Promise<boolean>;
  getMaxBid: (teamId: string, category: Player['category']) => number;
  lastSale: LastSale | null;
  reverseLastSale: () => Promise<boolean>;
  refreshData: () => Promise<void>;
}

const AuctionContext = createContext<AuctionContextType | undefined>(undefined);

export function AuctionProvider({ children }: { children: React.ReactNode }) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAuction, setCurrentAuction] = useState<CurrentAuction>({
    playerId: null,
    currentBid: 0,
    biddingTeamId: null,
  });
  const [lastSale, setLastSale] = useState<LastSale | null>(null);

  // Fetch data from API
  const fetchData = async () => {
    if (typeof window === 'undefined') return;

    try {
      setLoading(true);
      const [playersRes, teamsRes, lastSaleRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams'),
        fetch('/api/last-sale'),
      ]);

      const playersData = await playersRes.json();
      const teamsData = await teamsRes.json();
      const lastSaleData = await lastSaleRes.json();

      if (playersData.success) {
        setPlayers(playersData.data);
      }

      if (teamsData.success) {
        setTeams(teamsData.data);
      }

      if (lastSaleData.success && lastSaleData.data) {
        setLastSale(lastSaleData.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchData();
    }
  }, []);

  const refreshData = async () => {
    await fetchData();
  };

  const addPlayer = async (player: Omit<Player, 'id'>) => {
    const newPlayer: Player = {
      ...player,
      id: `player-${Date.now()}`,
    };

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlayer),
      });

      const data = await res.json();
      if (data.success) {
        setPlayers([...players, data.data]);
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const removePlayer = async (playerId: string) => {
    try {
      const res = await fetch(`/api/players/${playerId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (data.success) {
        setPlayers(players.filter(p => p.id !== playerId));
      }
    } catch (error) {
      console.error('Error removing player:', error);
    }
  };

  const updatePlayer = async (playerId: string, updates: Partial<Player>) => {
    try {
      const player = players.find(p => p.id === playerId);
      if (!player) return;

      const updatedPlayer = { ...player, ...updates };

      const res = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayer),
      });

      const data = await res.json();
      if (data.success) {
        setPlayers(players.map(p => (p.id === playerId ? data.data : p)));
      }
    } catch (error) {
      console.error('Error updating player:', error);
    }
  };

  const setCurrentAuctionPlayer = (playerId: string | null) => {
    const player = playerId ? players.find(p => p.id === playerId) : null;
    setCurrentAuction({
      playerId,
      currentBid: player ? AUCTION_RULES.minBidAmount[player.category] : 0,
      biddingTeamId: null,
    });
  };

  const getMaxBid = (teamId: string, category: Player['category']): number => {
    const team = teams.find(t => t.id === teamId);
    if (!team) return 0;

    const totalPlayers = team.players.length;
    const categoryCount = team.categoryCount[category];
    const categoryLimit = AUCTION_RULES.categoryLimits[category];

    if (categoryCount >= categoryLimit.max) return 0;
    if (totalPlayers >= AUCTION_RULES.maxPlayers) return 0;

    let minBudgetNeeded = 0;

    const remainingGold = Math.max(
      0,
      AUCTION_RULES.categoryLimits.GOLD.min - team.categoryCount.GOLD,
    );
    const remainingSilver = Math.max(
      0,
      AUCTION_RULES.categoryLimits.SILVER.min - team.categoryCount.SILVER,
    );
    const remainingLegend = Math.max(
      0,
      AUCTION_RULES.categoryLimits.LEGEND.min - team.categoryCount.LEGEND,
    );
    const remainingYoungstar = Math.max(
      0,
      AUCTION_RULES.categoryLimits.YOUNGSTAR.min - team.categoryCount.YOUNGSTAR,
    );
    const remainingBronze = Math.max(
      0,
      AUCTION_RULES.categoryLimits.BRONZE.min - team.categoryCount.BRONZE,
    );

    const adjustedRemainingGold =
      category === 'GOLD' ? Math.max(0, remainingGold - 1) : remainingGold;
    const adjustedRemainingSilver =
      category === 'SILVER'
        ? Math.max(0, remainingSilver - 1)
        : remainingSilver;
    const adjustedRemainingLegend =
      category === 'LEGEND'
        ? Math.max(0, remainingLegend - 1)
        : remainingLegend;
    const adjustedRemainingYoungstar =
      category === 'YOUNGSTAR'
        ? Math.max(0, remainingYoungstar - 1)
        : remainingYoungstar;
    const adjustedRemainingBronze =
      category === 'BRONZE'
        ? Math.max(0, remainingBronze - 1)
        : remainingBronze;

    minBudgetNeeded += adjustedRemainingGold * AUCTION_RULES.minBidAmount.GOLD;
    minBudgetNeeded +=
      adjustedRemainingSilver * AUCTION_RULES.minBidAmount.SILVER;
    minBudgetNeeded +=
      adjustedRemainingLegend * AUCTION_RULES.minBidAmount.LEGEND;
    minBudgetNeeded +=
      adjustedRemainingYoungstar * AUCTION_RULES.minBidAmount.YOUNGSTAR;
    minBudgetNeeded +=
      adjustedRemainingBronze * AUCTION_RULES.minBidAmount.BRONZE;

    const requiredPlayers =
      adjustedRemainingGold +
      adjustedRemainingSilver +
      adjustedRemainingLegend +
      adjustedRemainingYoungstar +
      adjustedRemainingBronze;

    const totalAfterPurchase = totalPlayers + 1;
    const additionalPlayersNeeded = Math.max(
      0,
      AUCTION_RULES.minPlayers - totalAfterPurchase - requiredPlayers,
    );
    minBudgetNeeded +=
      additionalPlayersNeeded * AUCTION_RULES.minBidAmount.BRONZE;

    const availableForThisPlayer = team.remainingPurse - minBudgetNeeded;

    return Math.max(0, availableForThisPlayer);
  };

  const addPlayerToTeam = async (
    playerId: string,
    teamId: string,
    amount: number,
  ): Promise<boolean> => {
    const player = players.find(p => p.id === playerId);
    const team = teams.find(t => t.id === teamId);

    if (!player || !team) return false;
    if (player.teamId) return false;
    if (amount < AUCTION_RULES.minBidAmount[player.category]) return false;

    const maxBid = getMaxBid(teamId, player.category);
    if (amount > maxBid) return false;

    try {
      // Update player
      const updatedPlayer = { ...player, teamId, soldAmount: amount };
      const playerRes = await fetch(`/api/players/${playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayer),
      });

      const playerData = await playerRes.json();
      if (!playerData.success) return false;

      // Update team
      const updatedTeam = {
        ...team,
        players: [...team.players, updatedPlayer],
        remainingPurse: team.remainingPurse - amount,
        categoryCount: {
          ...team.categoryCount,
          [player.category]: team.categoryCount[player.category] + 1,
        },
      };

      const teamRes = await fetch(`/api/teams/${teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeam),
      });

      const teamData = await teamRes.json();
      if (!teamData.success) return false;

      // Store the sale for potential undo in database
      const saleData = {
        playerId,
        teamId,
        amount,
        timestamp: Date.now(),
      };

      const lastSaleRes = await fetch('/api/last-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData),
      });

      const lastSaleResult = await lastSaleRes.json();
      if (lastSaleResult.success) {
        setLastSale(saleData);
      }

      // Update local state
      setPlayers(players.map(p => (p.id === playerId ? updatedPlayer : p)));
      setTeams(teams.map(t => (t.id === teamId ? updatedTeam : t)));

      setCurrentAuction({
        playerId: null,
        currentBid: 0,
        biddingTeamId: null,
      });

      return true;
    } catch (error) {
      console.error('Error adding player to team:', error);
      return false;
    }
  };

  const reverseLastSale = async (): Promise<boolean> => {
    if (!lastSale) return false;

    const player = players.find(p => p.id === lastSale.playerId);
    const team = teams.find(t => t.id === lastSale.teamId);

    if (!player || !team || player.teamId !== lastSale.teamId) {
      setLastSale(null);
      return false;
    }

    try {
      // Update player - remove team assignment
      const updatedPlayer = {
        ...player,
        teamId: undefined,
        soldAmount: undefined,
      };
      const playerRes = await fetch(`/api/players/${lastSale.playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPlayer),
      });

      const playerData = await playerRes.json();
      if (!playerData.success) return false;

      // Update team - remove player and restore purse
      const updatedTeam = {
        ...team,
        players: team.players.filter(p => p.id !== lastSale.playerId),
        remainingPurse: team.remainingPurse + lastSale.amount,
        categoryCount: {
          ...team.categoryCount,
          [player.category]: team.categoryCount[player.category] - 1,
        },
      };

      const teamRes = await fetch(`/api/teams/${lastSale.teamId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTeam),
      });

      const teamData = await teamRes.json();
      if (!teamData.success) return false;

      // Update local state
      setPlayers(
        players.map(p =>
          p.id === lastSale.playerId
            ? { ...p, teamId: undefined, soldAmount: undefined }
            : p,
        ),
      );

      setTeams(teams.map(t => (t.id === lastSale.teamId ? updatedTeam : t)));

      // Delete last sale from database and get next sale
      const deleteRes = await fetch('/api/last-sale', {
        method: 'DELETE',
      });

      const deleteData = await deleteRes.json();

      // Update lastSale with the next sale (if any), enabling multi-level undo
      if (deleteData.success && deleteData.data) {
        setLastSale(deleteData.data);
      } else {
        setLastSale(null);
      }

      return true;
    } catch (error) {
      console.error('Error reversing sale:', error);
      return false;
    }
  };

  return (
    <AuctionContext.Provider
      value={{
        players,
        teams,
        currentAuction,
        loading,
        addPlayer,
        removePlayer,
        updatePlayer,
        setCurrentAuctionPlayer,
        addPlayerToTeam,
        getMaxBid,
        lastSale,
        reverseLastSale,
        refreshData,
      }}
    >
      {children}
    </AuctionContext.Provider>
  );
}

export function useAuction() {
  const context = useContext(AuctionContext);
  if (context === undefined) {
    throw new Error('useAuction must be used within an AuctionProvider');
  }
  return context;
}
