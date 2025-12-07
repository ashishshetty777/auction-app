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
import { CATEGORY_COLORS } from '@/lib/constants';
import { PlayerCategory, PlayingRole } from '@/types';
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react';

export default function PlayersPage() {
  const { players, addPlayer, removePlayer } = useAuction();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<PlayerCategory | 'ALL'>(
    'ALL',
  );
  console.log(players, 'mijiji');
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    mobileNumber: '',
    playingRole: 'Allrounder' as PlayingRole,
    wing: '',
    flatNumber: '',
    dateOfBirth: '',
    age: 0,
    category: 'BRONZE' as PlayerCategory,
  });

  const filteredPlayers = players.filter(player => {
    const matchesSearch = player.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      filterCategory === 'ALL' || player.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddPlayer = () => {
    if (!newPlayer.name || !newPlayer.mobileNumber || !newPlayer.dateOfBirth) {
      alert('Please fill in all required fields');
      return;
    }

    addPlayer(newPlayer);
    setNewPlayer({
      name: '',
      mobileNumber: '',
      playingRole: 'Allrounder',
      wing: '',
      flatNumber: '',
      dateOfBirth: '',
      age: 0,
      category: 'BRONZE',
    });
    setShowAddDialog(false);
  };

  const handleRemovePlayer = (playerId: string, playerName: string) => {
    if (confirm(`Are you sure you want to remove ${playerName}?`)) {
      removePlayer(playerId);
    }
  };

  const availablePlayers = filteredPlayers.filter(p => !p.teamId);
  const soldPlayers = filteredPlayers.filter(p => p.teamId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
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

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Players Database
            </h1>
            <p className="text-gray-600 mt-1">
              Total: {players.length} | Available: {availablePlayers.length} |
              Sold: {soldPlayers.length}
            </p>
          </div>
          <Button onClick={() => setShowAddDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Player
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search players by name..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filterCategory}
                onChange={e =>
                  setFilterCategory(e.target.value as PlayerCategory | 'ALL')
                }
              >
                <option value="ALL">All Categories</option>
                <option value="LEGEND">Legend</option>
                <option value="YOUNGSTAR">Youngstar</option>
                <option value="GOLD">Gold</option>
                <option value="SILVER">Silver</option>
                <option value="BRONZE">Bronze</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          {filteredPlayers.map(player => (
            <Card key={player.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{player.name}</h3>
                      <Badge className={CATEGORY_COLORS[player.category]}>
                        {player.category}
                      </Badge>
                      {player.teamId && <Badge variant="secondary">SOLD</Badge>}
                    </div>
                    <div className="grid md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Role:</span>{' '}
                        {player.playingRole}
                      </div>
                      <div>
                        <span className="font-medium">Age:</span> {player.age}
                      </div>
                      <div>
                        <span className="font-medium">Location:</span>{' '}
                        {player.wing} {player.flatNumber}
                      </div>
                      <div>
                        <span className="font-medium">Mobile:</span>{' '}
                        {player.mobileNumber}
                      </div>
                    </div>
                    {player.soldAmount && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-green-600">
                          Sold Amount: ₹
                          {(player.soldAmount / 100000).toFixed(1)}L
                        </span>
                      </div>
                    )}
                  </div>
                  {!player.teamId && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemovePlayer(player.id, player.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPlayers.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center text-gray-500">
                No players found matching your criteria.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent onClose={() => setShowAddDialog(false)}>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
            <DialogDescription>
              Enter the details of the new player to add to the database.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name *</label>
              <Input
                value={newPlayer.name}
                onChange={e =>
                  setNewPlayer({ ...newPlayer, name: e.target.value })
                }
                placeholder="Player name"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Mobile Number *
              </label>
              <Input
                value={newPlayer.mobileNumber}
                onChange={e =>
                  setNewPlayer({ ...newPlayer, mobileNumber: e.target.value })
                }
                placeholder="10-digit mobile number"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Playing Role
                </label>
                <Select
                  value={newPlayer.playingRole}
                  onChange={e =>
                    setNewPlayer({
                      ...newPlayer,
                      playingRole: e.target.value as PlayingRole,
                    })
                  }
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Allrounder">Allrounder</option>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Category
                </label>
                <Select
                  value={newPlayer.category}
                  onChange={e =>
                    setNewPlayer({
                      ...newPlayer,
                      category: e.target.value as PlayerCategory,
                    })
                  }
                >
                  <option value="LEGEND">Legend</option>
                  <option value="YOUNGSTAR">Youngstar</option>
                  <option value="GOLD">Gold</option>
                  <option value="SILVER">Silver</option>
                  <option value="BRONZE">Bronze</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Wing</label>
                <Input
                  value={newPlayer.wing}
                  onChange={e =>
                    setNewPlayer({ ...newPlayer, wing: e.target.value })
                  }
                  placeholder="A-Wing, B-Wing, etc."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">
                  Flat Number
                </label>
                <Input
                  value={newPlayer.flatNumber}
                  onChange={e =>
                    setNewPlayer({ ...newPlayer, flatNumber: e.target.value })
                  }
                  placeholder="Flat number"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-1 block">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={newPlayer.dateOfBirth}
                  onChange={e =>
                    setNewPlayer({ ...newPlayer, dateOfBirth: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Age</label>
                <Input
                  type="number"
                  value={newPlayer.age}
                  onChange={e =>
                    setNewPlayer({
                      ...newPlayer,
                      age: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="Age"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlayer}>Add Player</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
