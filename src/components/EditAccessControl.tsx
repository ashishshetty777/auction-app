'use client';

import { useState } from 'react';
import { useEditAuth } from '@/providers/EditAuthProvider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Lock, Unlock } from 'lucide-react';

export function EditAccessControl() {
  const { isEditable, verifyPassword, logout } = useEditAuth();
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleAccessCheck = () => {
    if (isEditable) {
      // confirm logout
      if (confirm('Exit edit mode?')) {
        logout();
      }
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
      <Button
        onClick={handleAccessCheck}
        className={`fixed bottom-8 right-8 z-50 shadow-lg rounded-full w-12 h-12 p-0 ${
          isEditable ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-800 hover:bg-gray-900'
        }`}
        title={isEditable ? 'Edit Mode Enabled (Click to Lock)' : 'Enable Edit Mode'}
      >
        {isEditable ? (
          <Unlock className="w-5 h-5 text-white" />
        ) : (
          <Lock className="w-5 h-5 text-white" />
        )}
      </Button>

      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Admin Password</DialogTitle>
            <DialogDescription>
              Please enter the password to enable edit access.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className={error ? 'border-red-500' : ''}
                autoFocus
              />
              {error && (
                <p className="text-sm text-red-500">Incorrect password</p>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Unlock</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
