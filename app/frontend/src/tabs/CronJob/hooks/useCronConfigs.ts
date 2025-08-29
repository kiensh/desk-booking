import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { CronConfig } from '../../../types';
import { useApiRequest } from '../../../contexts/useApiRequest';
import { useUserContext } from '../../../contexts/UserContext';
import { fetchCronConfigsApi } from '../utils';

export const useCronConfigs = () => {
  const { user } = useUserContext();
  const apiRequest = useApiRequest();
  const [filteredCronConfigs, setFilteredCronConfigs] = useState<CronConfig[]>([]);
  const [editConfig, setEditConfig] = useState<CronConfig>({
    userName: '',
    email: '',
    autoBookingDesksId: [],
    autoBookingDesksName: [],
    autoBookingDaysOfWeek: [],
    autoCheckInDaysOfWeek: [],
    startHour: 9,
    startMinute: 0,
    endHour: 17,
    endMinute: 0,
  });

  const { data: cronConfigs = [], isSuccess } = useQuery({
    queryKey: ['cronConfigs'],
    queryFn: () => fetchCronConfigsApi(apiRequest),
  });

  useEffect(() => {
    if (isSuccess && !editConfig.userName) {
      const userConfigs = cronConfigs.find((u) => u.email === user?.email);
      if (userConfigs) {
        setEditConfig(userConfigs);
        setFilteredCronConfigs(cronConfigs.filter((u) => u.email !== user?.email));
      }
    }
  }, [isSuccess, cronConfigs, user?.email, editConfig.userName]);

  return {
    cronConfigs,
    filteredCronConfigs,
    editConfig,
    setEditConfig,
  };
};
