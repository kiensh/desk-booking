import { useQuery } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { Desk } from '../../../types';
import { useApiRequest } from '../../../contexts/useApiRequest';
import { DeskRequest } from '../DesksTab';

export function useDesks(deskRequest: DeskRequest) {
  const apiRequest = useApiRequest();

  const queryKey = useMemo(
    () => [
      'desks',
      deskRequest.date,
      deskRequest.startHour,
      deskRequest.startMinute,
      deskRequest.endHour,
      deskRequest.endMinute,
    ],
    [deskRequest],
  );

  const fetchDesks = useCallback(async (): Promise<Desk[]> => {
    const response = await apiRequest('/api/desks', {
      method: 'POST',
      body: JSON.stringify(deskRequest),
    });
    const data = await response.json();
    return data.desks ?? [];
  }, [deskRequest, apiRequest]);

  const {
    data: desks = [],
    isLoading,
    error,
  } = useQuery({
    queryKey,
    queryFn: fetchDesks,
    refetchOnWindowFocus: true,
    retry: false,
  });

  return {
    desks,
    isLoading,
    error,
  };
}
