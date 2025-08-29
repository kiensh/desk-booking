import { useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useApiRequest } from '../../../contexts/useApiRequest';
import { useToast } from '../../../contexts/ToastContext';
import { DeskRequest } from '../DesksTab';

export function useDeskBooking() {
  const queryClient = useQueryClient();
  const apiRequest = useApiRequest();
  const { showToast } = useToast();

  const bookDeskMutation = useMutation({
    mutationFn: async (bookingData: DeskRequest) => {
      const response = await apiRequest('/api/desks/book', {
        method: 'POST',
        body: JSON.stringify(bookingData),
      });
      return response.json();
    },
    onSuccess: () => {
      console.log('>>> onSuccess with empty data');
      queryClient.invalidateQueries({ queryKey: ['desks'] }).then((_) => _);
    },
  });

  const bookDesk = useCallback(
    (deskRequest: DeskRequest, selectedDesk: string) => {
      if (!selectedDesk) {
        showToast('Please select a desk', 'error');
        return;
      }

      const bookingData = {
        ...deskRequest,
        deskId: parseInt(selectedDesk),
      };

      showToast('Booking desk...', 'info');
      bookDeskMutation.mutate(bookingData, {
        onSuccess: () => {
          showToast(`Book desk ${selectedDesk} successfully for ${deskRequest.date}!`, 'success');
        },
        onError: (error) => {
          showToast(error?.message ?? 'Failed to book desk', 'error');
        },
      });
    },
    [bookDeskMutation],
  );

  return {
    bookDesk,
    isBooking: bookDeskMutation.isPending,
  };
}
