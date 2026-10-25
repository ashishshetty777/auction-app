'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface EditAuthContextType {
  isEditable: boolean;
  /** The unlock password, sent as x-admin-key on admin-only API calls */
  adminKey: string | null;
  verifyPassword: (password: string) => boolean;
  logout: () => void;
}

const EditAuthContext = createContext<EditAuthContextType | undefined>(undefined);

// Edit mode survives a refresh in this tab (sessionStorage), and ends when the tab closes.
const SESSION_KEY = 'scl-edit-mode';
const KEY_KEY = 'scl-admin-key';

export function EditAuthProvider({ children }: { children: ReactNode }) {
  const [isEditable, setIsEditable] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);

  useEffect(() => {
    try {
      // An edit session from before the admin key existed has no key; make the
      // admin unlock again rather than leave admin pages unable to load.
      const key = sessionStorage.getItem(KEY_KEY);
      if (sessionStorage.getItem(SESSION_KEY) === '1' && key) {
        setIsEditable(true);
        setAdminKey(key);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch {
      // storage unavailable: stay read-only
    }
  }, []);

  const verifyPassword = (password: string) => {
    // Check against the environment variable
    // Note: In a real secure app, this should be done server-side or via hash,
    // but per requirements/current architecture:
    const correctPassword = process.env.NEXT_PUBLIC_LOCAL_PASSWORD;
    if (password === correctPassword) {
      setIsEditable(true);
      setAdminKey(password);
      try {
        sessionStorage.setItem(SESSION_KEY, '1');
        sessionStorage.setItem(KEY_KEY, password);
      } catch {}
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsEditable(false);
    setAdminKey(null);
    try {
      sessionStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(KEY_KEY);
    } catch {}
  };

  return (
    <EditAuthContext.Provider value={{ isEditable, adminKey, verifyPassword, logout }}>
      {children}
    </EditAuthContext.Provider>
  );
}

export function useEditAuth() {
  const context = useContext(EditAuthContext);
  if (context === undefined) {
    throw new Error('useEditAuth must be used within an EditAuthProvider');
  }
  return context;
}
