'use client';

import { useState } from 'react';
import { useAuction } from '@/lib/auction-context';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { cn, formatMoney, sortPlayersByName, titleCase } from '@/lib/utils';
import { CATEGORY_META, CATEGORY_ORDER, REGISTRATION, SEASON } from '@/lib/constants';
import { ageOn, toStoredDate } from '@/lib/registration';
import { DateOfBirthSelect } from '@/components/ui/date-of-birth';
import { AppShell } from '@/components/AppShell';
import { PlayerPhoto } from '@/components/PlayerPhoto';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CategoryTag, StatusPill } from '@/components/ui/badge';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Player, PlayerCategory, PlayingRole } from '@/types';
import { Plus, Trash2, Search, Pencil, Loader2 } from 'lucide-react';

type StatusFilter = 'ALL' | 'POOL' | 'SOLD';

const EMPTY_PLAYER = {
  name: '',
  mobileNumber: '',
  playingRole: 'Allrounder' as PlayingRole,
  wing: '',
  flatNumber: '',
  dateOfBirth: '',
  age: 0,
  category: 'BRONZE' as PlayerCategory,
};

export default function PlayersPage() {
  const { players, teams, loading, addPlayer, removePlayer, updatePlayer } = useAuction();
  const { isEditable } = useEditAuth();
  const toast = useToast();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [removing, setRemoving] = useState<Player | null>(null);
  const [confirmImageDelete, setConfirmImageDelete] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<PlayerCategory | 'ALL'>('ALL');
  const [filterStatus, setFilterStatus] = useState<StatusFilter>('ALL');
  const [newPlayer, setNewPlayer] = useState(EMPTY_PLAYER);
  const [addError, setAddError] = useState<string | null>(null);

  const filteredPlayers = sortPlayersByName(
    players.filter(player => {
      const matchesSearch = player.name
        .toLowerCase()
        .includes(searchTerm.trim().toLowerCase());
      const matchesCategory =
        filterCategory === 'ALL' || player.category === filterCategory;
      const matchesStatus =
        filterStatus === 'ALL' ||
        (filterStatus === 'SOLD' ? !!player.teamId : !player.teamId);
      return matchesSearch && matchesCategory && matchesStatus;
    })
  );

  const soldTotal = players.filter(p => p.teamId).length;

  const handleAddPlayer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlayer.name || !newPlayer.mobileNumber || !newPlayer.dateOfBirth) {
      setAddError('Name, mobile number and date of birth are needed.');
      return;
    }

    // The picker gives yyyy-mm-dd; player records keep dd-mm-yyyy and the age on auction day.
    addPlayer({
      ...newPlayer,
      dateOfBirth: toStoredDate(newPlayer.dateOfBirth),
      age: ageOn(newPlayer.dateOfBirth),
    });
    toast({ tone: 'success', title: `${titleCase(newPlayer.name)} added to the pool` });
    setNewPlayer(EMPTY_PLAYER);
    setAddError(null);
    setShowAddDialog(false);
  };

  const handleRemovePlayer = async () => {
    if (!removing) return;
    await removePlayer(removing.id);
    toast({ tone: 'success', title: `${titleCase(removing.name)} removed` });
    setRemoving(null);
  };

  const handleUpdatePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
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
    toast({ tone: 'success', title: 'Changes saved' });
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
        // Update player immediately with new image URL
        await updatePlayer(editingPlayer.id, { imageUrl: newBlob.url });
        setEditingPlayer({ ...editingPlayer, imageUrl: newBlob.url });
      } else {
        throw new Error('No URL returned');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        tone: 'error',
        title: 'Photo didn’t upload',
        detail: 'Try a smaller JPG or PNG, or check the connection.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    setConfirmImageDelete(false);
    if (!editingPlayer?.imageUrl) return;

    setIsUploading(true);
    try {
      // Delete from blob storage
      await fetch(`/api/blob?url=${editingPlayer.imageUrl}`, {
        method: 'DELETE',
      });

      const updatedPlayer = { ...editingPlayer };
      delete updatedPlayer.imageUrl;
      setEditingPlayer(updatedPlayer);

      // An empty string clears the stored URL; the UI treats it as "no photo".
      await updatePlayer(editingPlayer.id, { imageUrl: '' as any });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({ tone: 'error', title: 'Photo wasn’t removed', detail: 'Try again in a moment.' });
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to convert dd-mm-yyyy to yyyy-mm-dd for input
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3 && parts[2].length === 4) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
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

  const teamName = (id?: string) => titleCase(teams.find(t => t.id === id)?.name ?? '');

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-black uppercase leading-none tracking-wide text-ink sm:text-5xl">
            Players
          </h1>
          <p className="tabular mt-2 text-[15px] text-ink-2">
            {players.length} registered · {soldTotal} sold
          </p>
        </div>
        {isEditable && (
          <Button variant="primary" onClick={() => setShowAddDialog(true)}>
            <Plus />
            Add player
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="sticky top-16 z-30 -mx-4 mt-6 border-b border-rule bg-night/90 px-4 pb-4 pt-3 backdrop-blur-md sm:-mx-6 sm:px-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
            <Input
              aria-label="Search players by name"
              placeholder="Search by name"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div role="group" aria-label="Category" className="flex flex-wrap gap-1.5">
            {(['ALL', ...CATEGORY_ORDER] as const).map(c => {
              const on = filterCategory === c;
              return (
                <button
                  key={c}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setFilterCategory(c)}
                  className={cn(
                    'inline-flex h-10 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors',
                    on ? 'border-cream bg-cream text-night' : 'border-rule-strong text-ink-2 hover:text-ink',
                  )}
                >
                  {c !== 'ALL' && (
                    <span
                      aria-hidden
                      className="h-2 w-2 rounded-[2px]"
                      style={{ background: CATEGORY_META[c].ink }}
                    />
                  )}
                  {c === 'ALL' ? 'All' : CATEGORY_META[c].label}
                </button>
              );
            })}
          </div>
          <div
            role="group"
            aria-label="Status"
            className="flex rounded-full border border-rule-strong p-0.5 lg:ml-auto"
          >
            {([
              ['ALL', 'Everyone'],
              ['POOL', 'In the pool'],
              ['SOLD', 'Sold'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={filterStatus === value}
                onClick={() => setFilterStatus(value)}
                className={cn(
                  'h-9 flex-1 whitespace-nowrap rounded-full px-3.5 text-sm font-semibold transition-colors',
                  filterStatus === value ? 'bg-night-3 text-ink' : 'text-ink-2 hover:text-ink',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster */}
      {loading ? (
        <div className="mt-4 grid gap-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-[4.5rem] animate-pulse rounded border border-rule bg-night-2" />
          ))}
        </div>
      ) : filteredPlayers.length === 0 ? (
        <div className="mt-10 rounded-md border border-rule px-6 py-12 text-center">
          <p className="font-display text-2xl font-extrabold uppercase tracking-wide text-ink">No players match</p>
          <p className="mt-2 text-[15px] text-ink-2">Clear the search or pick another category.</p>
          <Button
            className="mt-5"
            onClick={() => {
              setSearchTerm('');
              setFilterCategory('ALL');
              setFilterStatus('ALL');
            }}
          >
            Show everyone
          </Button>
        </div>
      ) : (
        <ul className="mt-2" aria-label="Players">
          {filteredPlayers.map(player => (
            <li
              key={player.id}
              className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b border-rule py-3 md:grid-cols-[3.5rem_minmax(0,1.6fr)_7rem_minmax(0,1fr)_minmax(0,1.3fr)_auto]"
            >
              <PlayerPhoto
                name={player.name}
                imageUrl={player.imageUrl}
                sizes="56px"
                className="row-span-2 h-14 w-14 rounded md:row-span-1"
              />
              <div className="min-w-0">
                <p className="truncate font-semibold text-ink">{titleCase(player.name)}</p>
                <p className="truncate text-sm text-ink-3">
                  {player.playingRole} · Age {player.age}
                </p>
              </div>
              <div className="md:order-none">
                <CategoryTag category={player.category} />
              </div>
              <div className="col-start-2 col-end-4 flex min-w-0 flex-wrap gap-x-3 text-sm text-ink-2 md:col-auto md:block">
                <p className="truncate">
                  {player.wing} {player.flatNumber}
                </p>
                <p className="tabular truncate text-ink-3">{player.mobileNumber}</p>
              </div>
              <div className="col-start-2 col-end-4 min-w-0 md:col-auto">
                {player.teamId ? (
                  <p className="truncate text-sm">
                    <StatusPill tone="sold" className="mr-2">Sold</StatusPill>
                    <span className="text-ink">{teamName(player.teamId)}</span>
                    {' · '}
                    <span className="tabular font-semibold text-cream">
                      {formatMoney(player.soldAmount || 0)}
                    </span>
                  </p>
                ) : (
                  <StatusPill>In the pool</StatusPill>
                )}
              </div>
              <div className="col-start-3 row-start-1 flex justify-end gap-1 md:col-auto md:row-auto">
                {isEditable && !player.teamId && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPlayer(player)}
                      title={`Edit ${player.name}`}
                    >
                      <Pencil />
                      <span className="sr-only">Edit {player.name}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setRemoving(player)}
                      title={`Remove ${player.name}`}
                      className="hover:text-[#ff8a90]"
                    >
                      <Trash2 />
                      <span className="sr-only">Remove {player.name}</span>
                    </Button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add player */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent onClose={() => setShowAddDialog(false)}>
          <DialogHeader>
            <DialogTitle>Add player</DialogTitle>
            <DialogDescription>They join the pool straight away.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPlayer} className="mt-5 grid gap-4">
            <Field id="add-name" label="Name">
              <Input
                id="add-name"
                data-autofocus
                value={newPlayer.name}
                onChange={e => setNewPlayer({ ...newPlayer, name: e.target.value })}
                placeholder="As it should appear on the chit"
              />
            </Field>
            <Field id="add-mobile" label="Mobile number">
              <Input
                id="add-mobile"
                type="tel"
                inputMode="numeric"
                value={newPlayer.mobileNumber}
                onChange={e => setNewPlayer({ ...newPlayer, mobileNumber: e.target.value })}
                placeholder="10-digit mobile number"
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field id="add-role" label="Playing role">
                <Select
                  id="add-role"
                  value={newPlayer.playingRole}
                  onChange={e => setNewPlayer({ ...newPlayer, playingRole: e.target.value as PlayingRole })}
                >
                  <option value="Batsman">Batsman</option>
                  <option value="Bowler">Bowler</option>
                  <option value="Allrounder">Allrounder</option>
                </Select>
              </Field>
              <Field id="add-category" label="Category">
                <Select
                  id="add-category"
                  value={newPlayer.category}
                  onChange={e => setNewPlayer({ ...newPlayer, category: e.target.value as PlayerCategory })}
                >
                  {CATEGORY_ORDER.map(c => (
                    <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                  ))}
                </Select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field id="add-wing" label="Wing">
                <Input
                  id="add-wing"
                  value={newPlayer.wing}
                  onChange={e => setNewPlayer({ ...newPlayer, wing: e.target.value })}
                  placeholder="B-Wing"
                />
              </Field>
              <Field id="add-flat" label="Flat">
                <Input
                  id="add-flat"
                  value={newPlayer.flatNumber}
                  onChange={e => setNewPlayer({ ...newPlayer, flatNumber: e.target.value })}
                  placeholder="1305"
                />
              </Field>
            </div>
            <Field
              id="add-dob"
              label="Date of birth"
              hint={newPlayer.dateOfBirth ? `${ageOn(newPlayer.dateOfBirth)} on auction day` : undefined}
            >
              <DateOfBirthSelect
                id="add-dob"
                value={newPlayer.dateOfBirth}
                onChange={v => setNewPlayer({ ...newPlayer, dateOfBirth: v })}
                fromYear={SEASON.year - REGISTRATION.maxAge}
                toYear={SEASON.year - REGISTRATION.minAge}
              />
            </Field>
            {addError && (
              <p role="alert" className="text-sm text-[#ff8a90]">
                {addError}
              </p>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowAddDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add player
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit player */}
      <Dialog open={!!editingPlayer} onOpenChange={open => !open && setEditingPlayer(null)}>
        <DialogContent className="max-w-2xl" onClose={() => setEditingPlayer(null)}>
          <DialogHeader>
            <DialogTitle>Edit player</DialogTitle>
            <DialogDescription>Update details and the photo shown on the stage.</DialogDescription>
          </DialogHeader>

          {editingPlayer && (
            <form onSubmit={handleUpdatePlayer} className="mt-5 grid gap-6">
              <div className="flex items-center gap-4 rounded-md border border-rule p-4">
                <PlayerPhoto
                  name={editingPlayer.name}
                  imageUrl={editingPlayer.imageUrl}
                  sizes="96px"
                  className="h-28 w-24 shrink-0 rounded"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">Stage photo</p>
                  {editingPlayer.imageUrl ? (
                    <>
                      <p className="mt-1 text-sm text-ink-3">To use a different photo, remove this one first.</p>
                      <Button
                        variant="danger-quiet"
                        size="sm"
                        className="mt-3"
                        onClick={() => setConfirmImageDelete(true)}
                        disabled={isUploading}
                      >
                        {isUploading ? <Loader2 className="animate-spin" /> : <Trash2 />}
                        Remove photo
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="mt-1 text-sm text-ink-3">A portrait JPG or PNG works best.</p>
                      <div className="mt-3 flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          aria-label="Upload photo"
                          onChange={handleImageUpload}
                          disabled={isUploading}
                          className="max-w-sm"
                        />
                        {isUploading && <Loader2 className="h-4 w-4 animate-spin text-ink-3" />}
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="grid gap-4">
                <Field id="edit-name" label="Name">
                  <Input
                    id="edit-name"
                    value={editingPlayer.name}
                    onChange={e => setEditingPlayer({ ...editingPlayer, name: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-2 gap-4">
                  <Field id="edit-category" label="Category">
                    <Select
                      id="edit-category"
                      value={editingPlayer.category}
                      onChange={e => setEditingPlayer({ ...editingPlayer, category: e.target.value as PlayerCategory })}
                    >
                      {CATEGORY_ORDER.map(c => (
                        <option key={c} value={c}>{CATEGORY_META[c].label}</option>
                      ))}
                    </Select>
                  </Field>
                  <Field id="edit-role" label="Role">
                    <Select
                      id="edit-role"
                      value={editingPlayer.playingRole}
                      onChange={e => setEditingPlayer({ ...editingPlayer, playingRole: e.target.value as PlayingRole })}
                    >
                      <option value="Batsman">Batsman</option>
                      <option value="Bowler">Bowler</option>
                      <option value="Allrounder">Allrounder</option>
                    </Select>
                  </Field>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Field id="edit-mobile" label="Mobile">
                    <Input
                      id="edit-mobile"
                      type="tel"
                      value={editingPlayer.mobileNumber}
                      onChange={e => setEditingPlayer({ ...editingPlayer, mobileNumber: e.target.value })}
                    />
                  </Field>
                  <Field id="edit-dob" label="Date of birth" className="col-span-2">
                    <DateOfBirthSelect
                      id="edit-dob"
                      value={formatDateForInput(editingPlayer.dateOfBirth)}
                      onChange={v =>
                        setEditingPlayer({
                          ...editingPlayer,
                          dateOfBirth: formatDateFromInput(v),
                          age: v ? ageOn(v) : editingPlayer.age,
                        })
                      }
                      fromYear={SEASON.year - REGISTRATION.maxAge}
                      toYear={SEASON.year - REGISTRATION.minAge}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <Field id="edit-wing" label="Wing">
                    <Input
                      id="edit-wing"
                      value={editingPlayer.wing}
                      onChange={e => setEditingPlayer({ ...editingPlayer, wing: e.target.value })}
                    />
                  </Field>
                  <Field id="edit-flat" label="Flat">
                    <Input
                      id="edit-flat"
                      value={editingPlayer.flatNumber}
                      onChange={e => setEditingPlayer({ ...editingPlayer, flatNumber: e.target.value })}
                    />
                  </Field>
                  <Field id="edit-age" label="Age">
                    <Input
                      id="edit-age"
                      type="number"
                      value={editingPlayer.age}
                      onChange={e => setEditingPlayer({ ...editingPlayer, age: parseInt(e.target.value) || 0 })}
                    />
                  </Field>
                </div>
              </div>

              <DialogFooter>
                <Button variant="ghost" onClick={() => setEditingPlayer(null)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  Save changes
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Remove player */}
      <Dialog open={!!removing} onOpenChange={open => !open && setRemoving(null)}>
        {removing && (
          <DialogContent className="max-w-md" onClose={() => setRemoving(null)}>
            <DialogHeader>
              <DialogTitle>Remove {titleCase(removing.name)}?</DialogTitle>
              <DialogDescription>
                They leave the pool and can’t be drawn. This can’t be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setRemoving(null)}>
                Keep player
              </Button>
              <Button variant="danger" onClick={handleRemovePlayer} data-autofocus>
                Remove player
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>

      {/* Remove photo (stacked over edit) */}
      <Dialog open={confirmImageDelete} onOpenChange={setConfirmImageDelete}>
        <DialogContent className="max-w-md" onClose={() => setConfirmImageDelete(false)}>
          <DialogHeader>
            <DialogTitle>Remove this photo?</DialogTitle>
            <DialogDescription>The stage will show their initials until a new photo is uploaded.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmImageDelete(false)}>
              Keep photo
            </Button>
            <Button variant="danger" onClick={handleDeleteImage} data-autofocus>
              Remove photo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
