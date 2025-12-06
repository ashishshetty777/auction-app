"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuction } from "@/lib/auction-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CATEGORY_COLORS, AUCTION_RULES } from "@/lib/constants";
import { ArrowLeft, Gavel, Plus, AlertCircle } from "lucide-react";

export default function AuctionPage() {
  const { players, teams, currentAuction, setCurrentAuctionPlayer, addPlayerToTeam, getMaxBid } = useAuction();
  const [showSoldDialog, setShowSoldDialog] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState("");
  const [bidAmount, setBidAmount] = useState("");

  const availablePlayers = players.filter(p => !p.teamId);
  const currentPlayer = currentAuction.playerId
    ? players.find(p => p.id === currentAuction.playerId)
    : null;

  const handlePlayerSold = () => {
    if (!currentAuction.playerId || !selectedTeamId || !bidAmount) {
      alert("Please select a team and enter bid amount");
      return;
    }

    const amount = parseFloat(bidAmount) * 100000;
    const success = addPlayerToTeam(currentAuction.playerId, selectedTeamId, amount);

    if (success) {
      setShowSoldDialog(false);
      setSelectedTeamId("");
      setBidAmount("");
      alert("Player sold successfully!");
    } else {
      alert("Failed to sell player. Please check team limits and budget.");
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Team Auction</h1>
          <p className="text-gray-600 mt-1">Manage team compositions and conduct auctions</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Current Player in Auction</CardTitle>
              <CardDescription>Select a player to start the auction</CardDescription>
            </CardHeader>
            <CardContent>
              {currentPlayer ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-semibold">{currentPlayer.name}</h3>
                        <Badge className={CATEGORY_COLORS[currentPlayer.category]}>
                          {currentPlayer.category}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Role: {currentPlayer.playingRole}</div>
                        <div>Age: {currentPlayer.age}</div>
                        <div>Base Price: {formatCurrency(AUCTION_RULES.minBidAmount[currentPlayer.category])}</div>
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
                      {teams.map((team) => {
                        const maxBid = getMaxBid(team.id, currentPlayer.category);
                        return (
                          <div key={team.id} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                            <span className="font-medium truncate">{team.name}</span>
                            <span className={maxBid > 0 ? "text-green-600" : "text-red-600"}>
                              {maxBid > 0 ? formatCurrency(maxBid) : "Cannot bid"}
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
                  <p className="text-gray-500 mb-4">No player selected for auction</p>
                  <Select
                    value=""
                    onChange={(e) => setCurrentAuctionPlayer(e.target.value)}
                    className="max-w-md mx-auto"
                  >
                    <option value="">Select a player...</option>
                    {availablePlayers.map((player) => (
                      <option key={player.id} value={player.id}>
                        {player.name} ({player.category})
                      </option>
                    ))}
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
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
                  <span className="font-semibold text-green-600">{availablePlayers.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Sold:</span>
                  <span className="font-semibold text-blue-600">{players.length - availablePlayers.length}</span>
                </div>
                <hr />
                <div className="space-y-2">
                  <h4 className="font-semibold">Category Breakdown</h4>
                  {["LEGEND", "YOUNGSTAR", "GOLD", "SILVER", "BRONZE"].map((cat) => {
                    const total = players.filter(p => p.category === cat).length;
                    const sold = players.filter(p => p.category === cat && p.teamId).length;
                    return (
                      <div key={cat} className="flex justify-between text-xs">
                        <Badge className={CATEGORY_COLORS[cat]} variant="outline">
                          {cat}
                        </Badge>
                        <span>{sold}/{total}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Teams</h2>
          {teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>
                      {team.players.length} players | Remaining Purse: {formatCurrency(team.remainingPurse)}
                    </CardDescription>
                  </div>
                  <div className="text-right text-sm">
                    <div className="font-semibold text-lg">{team.players.length}/{AUCTION_RULES.maxPlayers}</div>
                    <div className="text-gray-500">Players</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h4 className="text-sm font-semibold mb-2">Category Status</h4>
                  <div className="grid grid-cols-5 gap-2">
                    {(Object.keys(team.categoryCount) as Array<keyof typeof team.categoryCount>).map((cat) => {
                      const count = team.categoryCount[cat];
                      const limit = AUCTION_RULES.categoryLimits[cat];
                      const isComplete = count >= limit.min;
                      const isMax = count >= limit.max;

                      return (
                        <div key={cat} className="text-center p-2 border rounded">
                          <div className="text-xs font-medium">{cat}</div>
                          <div className={`text-lg font-bold ${isMax ? 'text-red-600' : isComplete ? 'text-green-600' : 'text-gray-600'}`}>
                            {count}/{limit.max}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {team.players.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">Players</h4>
                    <div className="grid gap-2">
                      {team.players.map((player) => (
                        <div key={player.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                          <div className="flex items-center gap-3">
                            <Badge className={CATEGORY_COLORS[player.category]}>
                              {player.category}
                            </Badge>
                            <div>
                              <div className="font-medium">{player.name}</div>
                              <div className="text-xs text-gray-600">{player.playingRole}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-green-600">
                              {player.soldAmount ? formatCurrency(player.soldAmount) : "-"}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No players yet
                  </div>
                )}

                {team.players.length < AUCTION_RULES.minPlayers && (
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm text-yellow-800">
                      Need at least {AUCTION_RULES.minPlayers - team.players.length} more player(s) to meet minimum requirement
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={showSoldDialog} onOpenChange={setShowSoldDialog}>
        <DialogContent onClose={() => setShowSoldDialog(false)}>
          <DialogHeader>
            <DialogTitle>Mark Player as Sold</DialogTitle>
            <DialogDescription>
              {currentPlayer && `${currentPlayer.name} (${currentPlayer.category})`}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Select Team *</label>
              <Select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
              >
                <option value="">Choose a team...</option>
                {teams.map((team) => {
                  const maxBid = currentPlayer ? getMaxBid(team.id, currentPlayer.category) : 0;
                  return (
                    <option key={team.id} value={team.id} disabled={maxBid === 0}>
                      {team.name} {maxBid > 0 ? `(Max: ${formatCurrency(maxBid)})` : '(Cannot bid)'}
                    </option>
                  );
                })}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Sold Amount (in Lakhs) *</label>
              <Input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                placeholder={currentPlayer ? `Min: ${AUCTION_RULES.minBidAmount[currentPlayer.category] / 100000}` : "0"}
                step="0.5"
                min={currentPlayer ? AUCTION_RULES.minBidAmount[currentPlayer.category] / 100000 : 0}
              />
              {currentPlayer && selectedTeamId && (
                <div className="mt-2 text-sm">
                  <div className="text-gray-600">
                    Min bid: {formatCurrency(AUCTION_RULES.minBidAmount[currentPlayer.category])}
                  </div>
                  <div className="text-gray-600">
                    Max bid: {formatCurrency(getMaxBid(selectedTeamId, currentPlayer.category))}
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
