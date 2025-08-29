import { useMemo } from 'react';
import { CronConfig } from '../../../types';
import { useUserContext } from '../../../contexts/UserContext';

export const useConflictDetection = (
  cronConfigs: CronConfig[],
  filteredCronConfigs: CronConfig[],
  editConfig: CronConfig,
) => {
  const { user } = useUserContext();

  const existingBookings = useMemo(() => {
    const bookings = new Set<string>();
    for (const config of cronConfigs) {
      if (config.email === user?.email) continue;
      for (let j = 0; j < config.autoBookingDesksId.length; j++) {
        if (config.autoBookingDaysOfWeek[j] === -1) continue;
        bookings.add(`${config.autoBookingDesksId[j]}-${config.autoBookingDaysOfWeek[j]}`);
      }
    }
    return bookings;
  }, [cronConfigs, user?.email]);

  const getConflictingUsers = (deskId: number, dayIndex: number): string[] => {
    const key = `${deskId}-${dayIndex}`;
    if (!existingBookings.has(key)) return [];

    return filteredCronConfigs
      .filter((config) => config !== editConfig)
      .filter((config) => {
        return config.autoBookingDesksId.some(
          (id, index) => id === deskId && config.autoBookingDaysOfWeek[index] === dayIndex,
        );
      })
      .map((config) => config.userName);
  };

  return { getConflictingUsers };
};
