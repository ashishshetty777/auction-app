'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuction } from '@/lib/auction-context';
import { useEditAuth } from '@/providers/EditAuthProvider';
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
import { Player, PlayerCategory, PlayingRole } from '@/types';
import { ArrowLeft, Plus, Trash2, Search, Edit, Upload, X, Loader2 } from 'lucide-react';

export default function PlayersPage() {
  const { players, addPlayer, removePlayer, updatePlayer } = useAuction();
  const { isEditable } = useEditAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<PlayerCategory | 'ALL'>(
    'ALL',
  );
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

  const handleUpdatePlayer = async () => {
    if (!editingPlayer) return;

    await updatePlayer(editingPlayer.id, {
      name: editingPlayer.name,
      mobileNumber: editingPlayer.mobileNumber,
      playingRole: editingPlayer.playingRole,
      wing: editingPlayer.wing,
      flatNumber: editingPlayer.flatNumber,
      dateOfBirth: editingPlayer.dateOfBirth,
      age: editingPlayer.age,
      category: editingPlayer.category,
    });
    setEditingPlayer(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !editingPlayer) return;
    
    setIsUploading(true);
    const file = e.target.files[0];
    
    try {
      const response = await fetch(
        `/api/blob?filename=${encodeURIComponent(file.name)}`,
        {
          method: 'POST',
          body: file,
        }
      );
      const newBlob = await response.json();
      
      if (newBlob.url) {
        // Update player immediately with new image URL as requested
        await updatePlayer(editingPlayer.id, { imageUrl: newBlob.url });
        setEditingPlayer({ ...editingPlayer, imageUrl: newBlob.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!editingPlayer?.imageUrl) return;
    
    if (!confirm('Are you sure you want to delete this image?')) return;

    setIsUploading(true);
    try {
      // Delete from blob storage
      await fetch(`/api/blob?url=${editingPlayer.imageUrl}`, {
        method: 'DELETE',
      });
      
      // Update player to remove image URL
      await updatePlayer(editingPlayer.id, { imageUrl: undefined });
      
      // Update local state
      // We need to explicitly cast undefined to any or handle optional delete in type better if strict
      // but here Partial<Player> allows undefined for optional keys if correctly typed.
      // However, typical JSON.stringify might strip undefined.
      // The updatePlayer implementation does { ...player, ...updates }.
      // If we pass undefined, it replaces the key with undefined.
      // But Mongoose/Backend might need explicit $unset or similar if just setting to undefined usually ignores it in JSON.
      // Let's rely on standard JSON behavior (key present but value null/undefined).
      // Actually usually null is better for clearing in Mongoose. 
      // Let's try passing empty string or check backend logic.
      // Backend (API) just does `findByIdAndUpdate`.
      
      // Let's pass empty string if we want to clear it, or allow our context to handle it.
      // The Player type has `imageUrl?: string` (optional).
      // updatePlayer takes Partial<Player>.
      
      const updatedPlayer = { ...editingPlayer };
      delete updatedPlayer.imageUrl;
      setEditingPlayer(updatedPlayer);

      // We need to re-fetch/update backend. 
      // Note: Passing { imageUrl: '' } might be cleaner if backend handles it.
      // Or { imageUrl: null } but TS might complain.
      // Let's send update as { imageUrl: '' } and handle empty string as "no image" in UI.
      await updatePlayer(editingPlayer.id, { imageUrl: '' as any }); 

    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image.');
    } finally {
      setIsUploading(false);
    }
  };

  const availablePlayers = filteredPlayers.filter(p => !p.teamId);
  const soldPlayers = filteredPlayers.filter(p => p.teamId);

  // Helper to convert dd-mm-yyyy to yyyy-mm-dd for input
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    // If already in yyyy-mm-dd format (or possibly invalid), return as is or handle
    // Check if it matches dd-mm-yyyy
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        // If year is last (dd-mm-yyyy)
        if (parts[2].length === 4) {
            return `${parts[2]}-${parts[1]}-${parts[0]}`;
        }
    }
    return dateStr;
  };

  // Helper to convert yyyy-mm-dd from input to dd-mm-yyyy for storage
  const formatDateFromInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
  };

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
          {isEditable && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          )}
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
                    {player.imageUrl && (
                      <div className="mb-3 w-16 h-16 relative rounded overflow-hidden border">
                         <Image 
                           src={player.imageUrl} 
                           alt={player.name} 
                           fill 
                           className="object-cover" 
                           sizes="64px"
                         />
                      </div>
                    )}
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
                  {(!player.teamId && isEditable) && (
                    <div className="flex gap-2">
                       <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingPlayer(player)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemovePlayer(player.id, player.name)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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

      <Dialog open={!!editingPlayer} onOpenChange={(open) => !open && setEditingPlayer(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Player</DialogTitle>
            <DialogDescription>
              Update player details and manage player image.
            </DialogDescription>
          </DialogHeader>

          {editingPlayer && (
            <div className="grid gap-6 py-4">
              {/* Image Upload Section */}
              <div className="p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">Player Photo</h3>
                <div className="flex items-center gap-4">
                  {editingPlayer.imageUrl ? (
                    <div className="flex items-center gap-4">
                       <div className="relative w-24 h-24 rounded-lg overflow-hidden border bg-white">
                         <Image 
                           src={editingPlayer.imageUrl} 
                           alt={editingPlayer.name} 
                           fill 
                           className="object-cover"
                         />
                       </div>
                       <Button 
                         variant="destructive" 
                         size="sm" 
                         onClick={handleDeleteImage}
                         disabled={isUploading}
                       >
                         {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
                         Delete Image
                       </Button>
                    </div>
                  ) : (
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                         <Input 
                           type="file" 
                           accept="image/*"
                           onChange={handleImageUpload}
                           disabled={isUploading}
                           className="max-w-sm"
                         />
                         {isUploading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Upload a new photo. Old photo must be deleted first if it exists.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Edit Details Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Name</label>
                  <Input
                    value={editingPlayer.name}
                    onChange={e =>
                      setEditingPlayer({ ...editingPlayer, name: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Category</label>
                    <Select
                      value={editingPlayer.category}
                      onChange={e =>
                        setEditingPlayer({
                          ...editingPlayer,
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

                  <div>
                    <label className="text-sm font-medium mb-1 block">Role</label>
                    <Select
                      value={editingPlayer.playingRole}
                      onChange={e =>
                        setEditingPlayer({
                          ...editingPlayer,
                          playingRole: e.target.value as PlayingRole,
                        })
                      }
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="Allrounder">Allrounder</option>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Mobile</label>
                    <Input
                      value={editingPlayer.mobileNumber}
                      onChange={e =>
                        setEditingPlayer({ ...editingPlayer, mobileNumber: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date of Birth</label>
                    <Input
                      type="date"
                      value={formatDateForInput(editingPlayer.dateOfBirth)}
                      onChange={e =>
                        setEditingPlayer({ 
                            ...editingPlayer, 
                            dateOfBirth: formatDateFromInput(e.target.value) 
                        })
                      }
                    />
                  </div>
                </div>

                 <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Wing</label>
                    <Input
                      value={editingPlayer.wing}
                      onChange={e =>
                        setEditingPlayer({ ...editingPlayer, wing: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Flat</label>
                    <Input
                      value={editingPlayer.flatNumber}
                      onChange={e =>
                        setEditingPlayer({ ...editingPlayer, flatNumber: e.target.value })
                      }
                    />
                  </div>
                   <div>
                    <label className="text-sm font-medium mb-1 block">Age</label>
                    <Input
                      type="number"
                      value={editingPlayer.age}
                      onChange={e =>
                        setEditingPlayer({ ...editingPlayer, age: parseInt(e.target.value) || 0 })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPlayer(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdatePlayer}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
