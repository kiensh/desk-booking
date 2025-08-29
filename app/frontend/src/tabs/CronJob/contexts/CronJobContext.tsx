import { createContext, ReactNode, useContext, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CronConfig, Desk } from '../../../types';
import { useApiRequest } from '../../../contexts/useApiRequest';
import { useToast } from '../../../contexts/ToastContext';
import { fetchDesksApi } from '../utils';
import { useCronConfigs } from '../hooks/useCronConfigs';
import { useConflictDetection } from '../hooks/useConflictDetection';
import { useConfigUpdates } from '../hooks/useConfigUpdates';

type CronJobContextType = {
  desks: Desk[];
  cronConfigs: CronConfig[];
  filteredCronConfigs: CronConfig[];
  editConfig: CronConfig;
  getConflictingUsers: (deskId: number, dayIndex: number) => string[];
  updateDesk: (dayIndex: number, value: string) => void;
  updateAutoBooking: (dayIndex: number, value: boolean) => void;
  updateAutoCheckIn: (dayIndex: number, value: boolean) => void;
  updateTime: (field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', value: number) => void;
  updateUserName: (value: string) => void;
  handleSave: () => void;
  isSaving: boolean;
};

const CronJobContext = createContext<CronJobContextType | undefined>(undefined);

export const CronJobProvider = ({ children }: { children: ReactNode }) => {
  const apiRequest = useApiRequest();
  const { showToast } = useToast();
  const { cronConfigs, filteredCronConfigs, editConfig, setEditConfig } = useCronConfigs();

  const { data: desks = [], error } = useQuery({
    queryKey: ['allDesks'],
    queryFn: () => fetchDesksApi(apiRequest),
  });

  if (error) {
    showToast(`Failed to fetch desks: ${error.message}`, 'error');
  }

  const { getConflictingUsers } = useConflictDetection(cronConfigs, filteredCronConfigs, editConfig);
  const { updateDesk, updateAutoBooking, updateAutoCheckIn, updateTime, updateUserName, handleSave, isSaving } =
    useConfigUpdates(editConfig, setEditConfig, desks);

  const value = useMemo(
    () => ({
      desks,
      cronConfigs,
      filteredCronConfigs,
      editConfig,
      getConflictingUsers,
      updateDesk,
      updateAutoBooking,
      updateAutoCheckIn,
      updateTime,
      updateUserName,
      handleSave,
      isSaving,
    }),
    [desks, cronConfigs, filteredCronConfigs, editConfig, isSaving],
  );

  return <CronJobContext.Provider value={value}>{children}</CronJobContext.Provider>;
};

export const useCronJobContext = () => {
  const context = useContext(CronJobContext);
  if (!context) {
    throw new Error('useCronJobContext must be used within CronJobProvider');
  }
  return context;
};
