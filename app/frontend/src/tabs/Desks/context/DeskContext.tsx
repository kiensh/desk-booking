import { createContext, useContext, useState, useMemo, ReactNode } from 'react';
import { DeskRequest } from '../DesksTab';

interface DeskContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  startTime: string;
  setStartTime: (time: string) => void;
  endTime: string;
  setEndTime: (time: string) => void;
  deskRequest: DeskRequest;
}

const DeskContext = createContext<DeskContextType | undefined>(undefined);

interface DeskProviderProps {
  children: ReactNode;
}

export function DeskProvider({ children }: Readonly<DeskProviderProps>) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [startTime, setStartTime] = useState<string>('9-0');
  const [endTime, setEndTime] = useState<string>('17-0');

  const deskRequest: DeskRequest = useMemo(
    () => ({
      date: currentDate.toISOString(),
      deskId: 0,
      deskName: '',
      startHour: parseInt(startTime.split('-')[0]),
      startMinute: parseInt(startTime.split('-')[1]),
      endHour: parseInt(endTime.split('-')[0]),
      endMinute: parseInt(endTime.split('-')[1]),
    }),
    [currentDate, startTime, endTime],
  );

  const value = useMemo(
    () => ({
      currentDate,
      setCurrentDate,
      startTime,
      setStartTime,
      endTime,
      setEndTime,
      deskRequest,
    }),
    [currentDate, startTime, endTime, deskRequest],
  );

  return <DeskContext.Provider value={value}>{children}</DeskContext.Provider>;
}

export function useDeskContext() {
  const context = useContext(DeskContext);
  if (context === undefined) {
    throw new Error('useDeskContext must be used within a DeskProvider');
  }
  return context;
}
