import React, { createContext, useContext, useMemo, useState } from 'react';
import { Desk } from '../types';

interface DesksContextType {
  desks: Desk[];
  setDesks: (desks: Desk[]) => void;
}

const DesksContext = createContext<DesksContextType | undefined>(undefined);

export const DesksProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [desks, setDesks] = useState<Desk[]>([]);

  const value = useMemo(
    () => ({
      desks,
      setDesks,
    }),
    [desks],
  );

  return <DesksContext.Provider value={value}>{children}</DesksContext.Provider>;
};

export const useDesksContext = (): DesksContextType => {
  const context = useContext(DesksContext);
  if (!context) {
    throw new Error('useDesksContext must be used within DesksProvider');
  }
  return context;
};
