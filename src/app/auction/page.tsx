'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuction } from '@/lib/auction-context';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CATEGORY_COLORS,
  CATEGORY_BG_COLORS,
  CATEGORY_BG_COLORS_HEX,
  CATEGORY_TEXT_COLORS,
  CATEGORY_TEXT_COLORS_HEX,
  AUCTION_RULES,
} from '@/lib/constants';
import { ArrowLeft, Gavel, AlertCircle, Undo2 } from 'lucide-react';

export default function AuctionPage() {
  const {
    players,
    teams,
    currentAuction,
    setCurrentAuctionPlayer,
    addPlayerToTeam,
    getMaxBid,
    lastSale,
    reverseLastSale,
  } = useAuction();
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [bidAmount, setBidAmount] = useState('');

  const availablePlayers = players.filter(p => !p.teamId);
  const sold = players.filter(p => p.teamId);

  const currentPlayer = currentAuction.playerId
    ? players.find(p => p.id === currentAuction.playerId)
    : null;

  const handlePlayerSold = async () => {
    if (!currentAuction.playerId || !selectedTeamId || !bidAmount) {
      alert('Please select a team and enter bid amount');
      return;
    }

    const amount = parseFloat(bidAmount) * 100000;
    const success = await addPlayerToTeam(
      currentAuction.playerId,
      selectedTeamId,
      amount,
    );

    if (success) {
      setShowSoldDialog(false);
      setSelectedTeamId('');
      setBidAmount('');
      alert('Player sold successfully!');
    } else {
      alert('Failed to sell player. Please check team limits and budget.');
    }
  };

  const handleReverseLastSale = async () => {
    if (!lastSale) return;

    const player = players.find(p => p.id === lastSale.playerId);
    const confirm = window.confirm(
      `Reverse the sale of ${player?.name} for ${formatCurrency(lastSale.amount)}?`,
    );

    if (confirm) {
      const success = await reverseLastSale();
      alert(
        success ? 'Sale reversed successfully!' : 'Failed to reverse sale.',
      );
    }
  };

  const formatCurrency = (amount: number) => {
    const crores = amount / 10000000;
    const lakhs = amount / 100000;
    if (crores >= 1) {
      return `₹${crores.toFixed(2)}Cr`;
    }
    return `₹${lakhs.toFixed(1)}L`;
  };

  // Define row category structure
  const getRowCategory = (rowIndex: number) => {
    if (rowIndex < 2) return 'GOLD'; // Rows 0-1: Gold (2)
    if (rowIndex < 7) return 'SILVER'; // Rows 2-6: Silver (5)
    if (rowIndex < 11) return 'BRONZE'; // Rows 7-10: Bronze (4)
    return rowIndex === 11 ? 'LEGEND' : 'YOUNGSTAR'; // Rows 11-12: Legend/Youngstar
  };

  const getRowBgColor = (rowIndex: number) => {
    const category = getRowCategory(rowIndex);
    return CATEGORY_BG_COLORS_HEX[category];
  };

  const getRowTextColor = (rowIndex: number) => {
    const category = getRowCategory(rowIndex);
    return CATEGORY_TEXT_COLORS_HEX[category];
  };

  // Get player for a specific slot based on category organization
  const getPlayerForSlot = (team: (typeof teams)[0], slotIndex: number) => {
    const rowCategory = getRowCategory(slotIndex);

    // Organize players by category
    const playersByCategory = {
      GOLD: team.players.filter(p => p.category === 'GOLD'),
      SILVER: team.players.filter(p => p.category === 'SILVER'),
      BRONZE: team.players.filter(p => p.category === 'BRONZE'),
      LEGEND: team.players.filter(p => p.category === 'LEGEND'),
      YOUNGSTAR: team.players.filter(p => p.category === 'YOUNGSTAR'),
    };

    // Determine which player to show based on slot index and category
    if (slotIndex < 2) {
      // Gold rows (0-1)
      return playersByCategory.GOLD[slotIndex];
    } else if (slotIndex < 7) {
      // Silver rows (2-6)
      return playersByCategory.SILVER[slotIndex - 2];
    } else if (slotIndex < 11) {
      // Bronze rows (7-10)
      return playersByCategory.BRONZE[slotIndex - 7];
    } else if (slotIndex === 11) {
      // Legend row (11)
      return playersByCategory.LEGEND[0];
    } else {
      // Youngstar row (12)
      return playersByCategory.YOUNGSTAR[0];
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8 max-w-[1800px]">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={handleReverseLastSale}
              disabled={!lastSale}
              className="border-orange-500 text-orange-700 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Undo Last Sale
            </Button>
            <Image
              src="/images/logo.jpg"
              alt="SCL 2026"
              width={80}
              height={27}
              className="object-contain"
            />
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs text-gray-500">Powered by</span>
            <Image
              src="/images/iotric.webp"
              alt="iotric"
              width={120}
              height={40}
            />
          </div>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Auction</h1>
          <p className="text-gray-600 mt-1">
            Manage team compositions and conduct auctions
          </p>
        </div>

        {/* Current Player Selection - Restored informative version */}
        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Current Player in Auction</CardTitle>
              <CardDescription>
                Select a player to start the auction
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlayer ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">
                          {currentPlayer.name}
                        </h3>
                        <Badge
                          className={CATEGORY_COLORS[currentPlayer.category]}
                        >
                          {currentPlayer.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Role: {currentPlayer.playingRole}</div>
                        <div>Age: {currentPlayer.age}</div>
                        <div>
                          Base Price:{' '}
                          {formatCurrency(
                            AUCTION_RULES.minBidAmount[currentPlayer.category],
                          )}
                        </div>
                      </div>
                    </div>
                    <Button onClick={() => setShowSoldDialog(true)} size="lg">
                      <Gavel className="w-4 h-4 mr-2" />
                      Mark as Sold
                    </Button>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">Maximum Bid by Team</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {teams.map(team => {
                        const maxBid = getMaxBid(
                          team.id,
                          currentPlayer.category,
                        );
                        return (
                          <div
                            key={team.id}
                            className="flex justify-between text-sm p-2 bg-gray-50 rounded"
                          >
                            <span className="font-medium truncate">
                              {team.name}
                            </span>
                            <span
                              className={
                                maxBid > 0 ? 'text-green-600' : 'text-red-600'
                              }
                            >
                              {maxBid > 0
                                ? formatCurrency(maxBid)
                                : 'Cannot bid'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentAuctionPlayer(null)}
                    className="w-full"
                  >
                    Clear Selection
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">
                    No player selected for auction
                  </p>
                  <Select
                    value=""
                    onChange={e => setCurrentAuctionPlayer(e.target.value)}
                    className="max-w-md mx-auto"
                  >
                    <option value="">Select a player...</option>
                    {availablePlayers.map(player => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.category})
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur">
            <CardHeader>
              <CardTitle>Auction Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Players:</span>
                  <span className="font-semibold">{players.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available:</span>
                  <span className="font-semibold text-green-600">
                    {availablePlayers.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sold:</span>
                  <span className="font-semibold text-blue-600">
                    {players.length - availablePlayers.length}
                  </span>
                </div>
                <hr />
                <div className="space-y-2">
                  <h4 className="font-semibold">Category Breakdown</h4>
                  {['LEGEND', 'YOUNGSTAR', 'GOLD', 'SILVER', 'BRONZE'].map(
                    cat => {
                      const total = players.filter(
                        p => p.category === cat,
                      ).length;
                      const sold = players.filter(
                        p => p.category === cat && p.teamId,
                      ).length;
                      return (
                        <div key={cat} className="flex justify-between text-xs">
                          <Badge
                            className={CATEGORY_COLORS[cat]}
                            variant="outline"
                          >
                            {cat}
                          </Badge>
                          <span>
                            {sold}/{total}
                          </span>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Teams Grid - 7 Columns with aligned rows */}
        <div className="hidden lg:grid lg:grid-cols-7 gap-3 mb-6">
          {teams.map(team => {
            const slots = Array.from({ length: 13 }, (_, i) => i);

            return (
              <div key={team.id} className="flex flex-col gap-2">
                {/* Team Header - Flat color */}
                <div className="bg-blue-600 text-white rounded-lg p-3 shadow-lg">
                  <h3 className="font-bold text-sm text-center mb-2 leading-tight h-8 flex items-center justify-center">
                    {team.name}
                  </h3>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span>Players:</span>
                      <span className="font-semibold">
                        {team.players.length}/13
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Purse:</span>
                      <span className="font-semibold">
                        {formatCurrency(team.remainingPurse)}
                      </span>
                    </div>
                    {currentPlayer && (
                      <div className="flex justify-between pt-1 border-t border-white/20">
                        <span>Max Bid:</span>
                        <span className="font-semibold text-yellow-300">
                          {getMaxBid(team.id, currentPlayer.category) > 0
                            ? formatCurrency(
                                getMaxBid(team.id, currentPlayer.category),
                              )
                            : '-'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Player Slots - Aligned rows with category backgrounds */}
                <div className="space-y-1">
                  {slots.map(slotIndex => {
                    const rowCategory = getRowCategory(slotIndex);
                    const bgColor = getRowBgColor(slotIndex);
                    const textColor = getRowTextColor(slotIndex);
                    const player = getPlayerForSlot(team, slotIndex);

                    if (player) {
                      return (
                        <div
                          key={slotIndex}
                          className="rounded p-2 shadow-sm h-16 flex flex-col justify-center"
                          style={{ backgroundColor: bgColor, color: textColor }}
                        >
                          <div className="text-xs font-semibold truncate">
                            {player.name}
                          </div>
                          <div className="text-xs opacity-90">
                            {formatCurrency(player.soldAmount || 0)}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={slotIndex}
                          className="opacity-30 rounded p-2 text-center border-2 border-dashed border-white h-16 flex items-center justify-center"
                          style={{ backgroundColor: bgColor, color: textColor }}
                        >
                          <div className="text-xs font-semibold">
                            {slotIndex + 1}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Mobile/Tablet View - Stacked Cards */}
        <div className="lg:hidden space-y-6">
          {teams.map(team => (
            <Card key={team.id} className="bg-white/80 backdrop-blur">
              <CardHeader className="bg-blue-600 text-white rounded-t-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="text-white/90 text-sm">
                      {team.players.length} players |{' '}
                      {formatCurrency(team.remainingPurse)}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-2xl">
                      {team.players.length}/13
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {/* Category Status */}
                <div className="mb-4">
                  <div className="grid grid-cols-5 gap-2">
                    {(
                      Object.keys(team.categoryCount) as Array<
                        keyof typeof team.categoryCount
                      >
                    ).map(cat => {
                      const count = team.categoryCount[cat];
                      const limit = AUCTION_RULES.categoryLimits[cat];

                      return (
                        <div key={cat} className="text-center">
                          <div
                            className={`${CATEGORY_BG_COLORS[cat]} ${CATEGORY_TEXT_COLORS[cat]} rounded p-2 font-bold`}
                          >
                            {count}/{limit.max}
                          </div>
                          <div className="text-xs text-gray-600 mt-1">
                            {cat}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Players */}
                {team.players.length > 0 ? (
                  <div className="space-y-2">
                    {team.players.map((player, idx) => (
                      <div
                        key={player.id}
                        className={`${CATEGORY_BG_COLORS[player.category]} ${CATEGORY_TEXT_COLORS[player.category]} rounded p-3 flex justify-between items-center`}
                      >
                        <div>
                          <div className="font-semibold">
                            {idx + 1}. {player.name}
                          </div>
                          <div className="text-sm opacity-90">
                            {player.playingRole}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {formatCurrency(player.soldAmount || 0)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No players yet
                  </div>
                )}

                {team.players.length < AUCTION_RULES.minPlayers && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-yellow-800">
                      Need {AUCTION_RULES.minPlayers - team.players.length} more
                      player(s)
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Sold Dialog */}
      <Dialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
        <DialogContent onClose={() => setShowSoldDialog(false)}>
          <DialogHeader>
            <DialogTitle>Mark Player as Sold</DialogTitle>
            <DialogDescription>
              {currentPlayer &&
                `${currentPlayer.name} (${currentPlayer.category})`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Select Team *
              </label>
              <Select
                value={selectedTeamId}
                onChange={e => setSelectedTeamId(e.target.value)}
              >
                <option value="">Choose a team...</option>
                {teams.map(team => {
                  const maxBid = currentPlayer
                    ? getMaxBid(team.id, currentPlayer.category)
                    : 0;
                  return (
                    <option
                      key={team.id}
                      value={team.id}
                      disabled={maxBid === 0}
                    >
                      {team.name}{' '}
                      {maxBid > 0
                        ? `(Max: ${formatCurrency(maxBid)})`
                        : '(Cannot bid)'}
                    </option>
                  );
                })}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Sold Amount (in Lakhs) *
              </label>
              <Input
                type="number"
                value={bidAmount}
                onChange={e => setBidAmount(e.target.value)}
                placeholder={
                  currentPlayer
                    ? `Min: ${AUCTION_RULES.minBidAmount[currentPlayer.category] / 100000}`
                    : '0'
                }
                step="0.5"
                min={
                  currentPlayer
                    ? AUCTION_RULES.minBidAmount[currentPlayer.category] /
                      100000
                    : 0
                }
              />
              {currentPlayer && selectedTeamId && (
                <div className="mt-2 text-sm space-y-1">
                  <div className="text-gray-600">
                    Min bid:{' '}
                    {formatCurrency(
                      AUCTION_RULES.minBidAmount[currentPlayer.category],
                    )}
                  </div>
                  <div className="text-gray-600">
                    Max bid:{' '}
                    {formatCurrency(
                      getMaxBid(selectedTeamId, currentPlayer.category),
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSoldDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlayerSold}>Confirm Sale</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
