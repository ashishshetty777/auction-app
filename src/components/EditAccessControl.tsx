'use client';

import { useState } from 'react';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { Button } from '@/components/ui/button';
import { Input, Field } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EditAccessControl({ className }: { className?: string }) {
  const { isEditable, verifyPassword, logout } = useEditAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showLockDialog, setShowLockDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleAccessCheck = () => {
    if (isEditable) {
      setShowLockDialog(true);
    } else {
      setShowPasswordDialog(true);
      setError(false);
      setPassword('');
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    const isValid = verifyPassword(password);
    if (isValid) {
      setShowPasswordDialog(false);
      setPassword('');
    } else {
      setError(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAccessCheck}
        className={cn(
          'inline-flex h-10 shrink-0 items-center gap-2 rounded-full border px-3 text-sm font-semibold transition-colors sm:px-3.5',
          isEditable
            ? 'border-turf/50 bg-turf/10 text-turf hover:bg-turf/20'
            : 'border-rule-strong text-ink-2 hover:border-ink-3 hover:text-ink',
          className,
        )}
      >
        {isEditable ? (
          <Unlock className="h-4 w-4" />
        ) : (
          <Lock className="h-4 w-4" />
        )}
        <span className="sr-only sm:not-sr-only">{isEditable ? 'Editing' : 'View only'}</span>
      </button>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-md" onClose={() => setShowPasswordDialog(false)}>
          <DialogHeader>
            <DialogTitle>Unlock editing</DialogTitle>
            <DialogDescription>
              Enter the admin password to record sales and manage players on this device.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-5">
            <Field
              id="admin-password"
              label="Admin password"
              error={error ? 'That password is not right. Try again.' : null}
            >
              <Input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                aria-invalid={error}
                aria-describedby={error ? 'admin-password-error' : undefined}
                data-autofocus
              />
            </Field>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Unlock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showLockDialog} onOpenChange={setShowLockDialog}>
        <DialogContent className="max-w-md" onClose={() => setShowLockDialog(false)}>
          <DialogHeader>
            <DialogTitle>Lock editing?</DialogTitle>
            <DialogDescription>
              This device goes back to view only. You will need the password to record sales again.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowLockDialog(false)}>
              Keep editing
            </Button>
            <Button
              variant="primary"
              data-autofocus
              onClick={() => {
                logout();
                setShowLockDialog(false);
              }}
            >
              Lock
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
