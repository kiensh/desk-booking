import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { User } from '../types';

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const key = 'user-data';
const loadUserdata = (): User | null => {
  return JSON.parse(localStorage.getItem(key) ?? 'null');
};
const saveUserdata = (user: User | null) => {
  if (user) {
    localStorage.setItem(key, JSON.stringify(user));
  } else {
    localStorage.removeItem('user-data');
  }
};

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(loadUserdata());

  useEffect(() => {
    saveUserdata(user);
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      setUser,
    }),
    [user, setUser],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = (): UserContextType => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};
