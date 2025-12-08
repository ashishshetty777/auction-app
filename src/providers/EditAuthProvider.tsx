'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface EditAuthContextType {
  isEditable: boolean;
  verifyPassword: (password: string) => boolean;
  logout: () => void;
}

const EditAuthContext = createContext<EditAuthContextType | undefined>(undefined);

export function EditAuthProvider({ children }: { children: ReactNode }) {
  const [isEditable, setIsEditable] = useState(false);

  const verifyPassword = (password: string) => {
    // Check against the environment variable
    // Note: In a real secure app, this should be done server-side or via hash, 
    // but per requirements/current architecture:
    const correctPassword = process.env.NEXT_PUBLIC_LOCAL_PASSWORD;
    if (password === correctPassword) {
      setIsEditable(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsEditable(false);
  };

  return (
    <EditAuthContext.Provider value={{ isEditable, verifyPassword, logout }}>
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
