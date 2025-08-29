import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { ActionType, Reservation, ReservationState } from '../../types.ts';
import { useApiRequest } from '../../contexts/useApiRequest.ts';
import { useToast } from '../../contexts/ToastContext';

const stateToTextMapping = {
  [ReservationState.AWAITING_CHECK_IN]: 'Awaiting Check In',
  [ReservationState.CHECKED_IN]: 'Checked In',
  [ReservationState.EXPIRED]: 'Expired',
  [ReservationState.CANCELED]: 'Canceled',
  [ReservationState.CANCELED_BY_ADMIN]: 'Canceled by Admin',
  [ReservationState.CHECKED_OUT]: 'Checked Out',
  [ReservationState.UNKNOWN]: 'Unknown',
};
const getStateText = (status: ReservationState): string => stateToTextMapping[status] ?? 'Unknown';

const stateToColorMapping = {
  [ReservationState.AWAITING_CHECK_IN]: '#808080',
  [ReservationState.CHECKED_IN]: '#ffc107',
  [ReservationState.EXPIRED]: '#dc3545',
  [ReservationState.CANCELED]: '#dc3545',
  [ReservationState.CANCELED_BY_ADMIN]: '#dc3545',
  [ReservationState.CHECKED_OUT]: '#ffc107',
  [ReservationState.UNKNOWN]: '#808080',
};
const getStateColor = (reservation: Reservation): string => {
  if (canCheckIn(reservation)) {
    return '#28a745';
  }
  return stateToColorMapping[reservation.state] ?? '';
};

const canCheckIn = (reservation: Reservation): boolean =>
  reservation.state === ReservationState.AWAITING_CHECK_IN &&
  (reservation.checkInStatus === 'CHECK_IN' || reservation.checkInStatus === 'CHECK_IN_NO_ROLL');

const canCheckOut = (reservation: Reservation): boolean =>
  reservation.state === ReservationState.CHECKED_IN && reservation.checkInStatus === 'CHECK_OUT';

const canCancel = (reservation: Reservation): boolean =>
  reservation.state !== ReservationState.CANCELED && reservation.state !== ReservationState.CANCELED_BY_ADMIN;

const fetchReservations = async (
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>,
): Promise<Reservation[]> => {
  const response = await apiRequest('/api/reservations', {
    method: 'POST',
    body: JSON.stringify({
      date: Date.now(),
    }),
  });
  const data = await response.json();
  return data.reservations ?? [];
};

const performReservationAction = async (
  {
    reservationId,
    actionType,
  }: {
    reservationId: string;
    actionType: ActionType;
  },
  apiRequest: (url: string, options?: RequestInit) => Promise<Response>,
) => {
  const response = await apiRequest('/api/reservations/action', {
    method: 'POST',
    body: JSON.stringify({ reservationId, actionType }),
  });
  return response.json();
};

export default function ReservationsTab() {
  const apiRequest = useApiRequest();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [filterState, setFilterState] = useState<string>(ReservationState.AWAITING_CHECK_IN);
  const { data: reservations = [], isLoading } = useQuery({
    queryKey: ['reservations'],
    queryFn: () => fetchReservations(apiRequest),
    refetchOnWindowFocus: true,
  });

  const filteredReservations = reservations.filter((res) => {
    if (filterState === 'all') return true;
    if (filterState === ReservationState.AWAITING_CHECK_IN) {
      return res.state === ReservationState.AWAITING_CHECK_IN || res.state === ReservationState.CHECKED_IN;
    }
    if (filterState === ReservationState.CANCELED) {
      return res.state === ReservationState.CANCELED || res.state === ReservationState.CANCELED_BY_ADMIN;
    }
    return res.state === filterState;
  });

  const mutation = useMutation({
    mutationFn: (variables: any) => performReservationAction(variables, apiRequest),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reservations'] }).then((_) => _);
    },
  });

  const reservationAction = (reservationId: string, actionType: ActionType) => {
    const actionNames: Record<ActionType, string> = {
      [ActionType.CANCEL]: 'Cancel',
      [ActionType.CHECK_IN]: 'Check In',
      [ActionType.CHECK_OUT]: 'Check Out',
    };
    const actionName = actionNames[actionType];

    mutation.mutate(
      { reservationId, actionType },
      {
        onSuccess: (data) => {
          if (data?.changes[0]?.succeeded) {
            showToast(`${actionName} successful!`, 'success');
          } else if (data?.changes[0]?.exceptionData) {
            showToast(`${actionName} failed: ${data.changes[0].exceptionData.message}`, 'error');
          } else {
            showToast(`${actionName} failed: Unknown error`, 'error');
          }
        },
        onError: (_) => {
          showToast(`${actionName} failed: Network error`, 'error');
        },
      },
    );
  };

  return (
    <div>
      <h3>My Reservations</h3>
      <div className="content-box">
        <div style={{ marginBottom: '15px' }}>
          <label>
            <span>Filter by state:</span>
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)} style={{ marginLeft: '10px' }}>
              <option value="all">All</option>
              <option value={ReservationState.AWAITING_CHECK_IN}>Awaiting Check In</option>
              <option value={ReservationState.CANCELED}>Canceled</option>
            </select>
          </label>
        </div>
        {isLoading ? (
          <div>Loading reservations...</div>
        ) : (
          filteredReservations.map((res) => {
            const [day, month, year] = res.date.split('-');
            const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

            return (
              <div
                key={res.id}
                style={{
                  margin: '5px 0',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                }}
              >
                <strong>{res.resourceName}</strong> ({res.location}) | {res.userName}
                <br />
                <small>
                  Date: {dayOfWeek}, {res.date} | Time: {res.startTime} - {res.endTime}
                </small>
                <br />
                <small>ID: {res.id}</small>
                {res.privateReservation && (
                  <small>
                    {' | '}
                    <strong>Private Reservation</strong>
                  </small>
                )}
                <br />
                <span
                  style={{
                    display: 'inline-block',
                    marginTop: '5px',
                    padding: '2px 6px',
                    backgroundColor: getStateColor(res),
                    color: 'white',
                    borderRadius: '3px',
                    fontSize: '12px',
                  }}
                >
                  {getStateText(res.state)}
                </span>
                <div style={{ marginTop: '10px' }}>
                  <button
                    onClick={() => reservationAction(res.id, 5)}
                    style={{ background: '#28a745', marginRight: '5px' }}
                    disabled={!canCheckIn(res)}
                  >
                    Check In
                  </button>
                  <button
                    onClick={() => reservationAction(res.id, 6)}
                    style={{ background: '#ffc107', marginRight: '5px' }}
                    disabled={!canCheckOut(res)}
                  >
                    Check Out
                  </button>
                  <button
                    onClick={() => reservationAction(res.id, 3)}
                    style={{ background: '#dc3545' }}
                    disabled={!canCancel(res)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
