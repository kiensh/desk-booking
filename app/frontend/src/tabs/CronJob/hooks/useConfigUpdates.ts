import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CronConfig, Desk } from '../../../types';
import { useApiRequest } from '../../../contexts/useApiRequest';
import { useToast } from '../../../contexts/ToastContext';
import { DayNumbers, updateCronConfigApi } from '../utils';
import { Dispatch, SetStateAction } from 'react';

export const useConfigUpdates = (
  editConfig: CronConfig,
  setEditConfig: Dispatch<SetStateAction<CronConfig>>,
  desks: Desk[],
) => {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const updateCronConfigMutation = useMutation({
    mutationFn: (config: CronConfig) => updateCronConfigApi(config, apiRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cronConfigs'] }).then((_) => _);
      showToast('Cron config updated successfully!', 'success');
    },
    onError: (error: Error) => {
      showToast(error.message || 'Failed to update cron config', 'error');
    },
  });

  const updateDesk = (dayIndex: number, value: string) => {
    const selectedDesk = value ? desks.find((d) => d.id === parseInt(value)) : null;
    const deskId = selectedDesk?.id ?? -1;
    const deskName = selectedDesk?.name ?? '';

    setEditConfig({
      ...editConfig,
      autoBookingDesksId: editConfig.autoBookingDesksId.every((id) => id === -1)
        ? [deskId, deskId, deskId, deskId, deskId]
        : editConfig.autoBookingDesksId.map((id, index) => (index === dayIndex ? deskId : id)),
      autoBookingDesksName: editConfig.autoBookingDesksName.every((name) => name === '')
        ? [deskName, deskName, deskName, deskName, deskName]
        : editConfig.autoBookingDesksName.map((name, index) => (index === dayIndex ? deskName : name)),
    });
  };

  const updateAutoBooking = (dayIndex: number, value: boolean) => {
    const data = value ? DayNumbers[dayIndex] : -1;
    setEditConfig({
      ...editConfig,
      autoBookingDaysOfWeek: editConfig.autoBookingDaysOfWeek.map((day, index) => (index === dayIndex ? data : day)),
    });
  };

  const updateAutoCheckIn = (dayIndex: number, value: boolean) => {
    const data = value ? DayNumbers[dayIndex] : -1;
    setEditConfig({
      ...editConfig,
      autoCheckInDaysOfWeek: editConfig.autoCheckInDaysOfWeek.map((day, index) => (index === dayIndex ? data : day)),
    });
  };

  const updateTime = (field: 'startHour' | 'startMinute' | 'endHour' | 'endMinute', value: number) => {
    setEditConfig((config): CronConfig => ({ ...config, [field]: value }));
  };

  const updateUserName = (value: string) => {
    setEditConfig({ ...editConfig, userName: value });
  };

  const handleSave = () => {
    updateCronConfigMutation.mutate(editConfig);
  };

  return {
    updateDesk,
    updateAutoBooking,
    updateAutoCheckIn,
    updateTime,
    updateUserName,
    handleSave,
    isSaving: updateCronConfigMutation.isPending,
  };
};
