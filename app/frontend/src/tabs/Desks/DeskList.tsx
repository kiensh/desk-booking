import { useCallback } from 'react';
import { Desk, DeskStatus } from '../../types';
import { useDeskContext } from './context';
import { useDesks, useDeskBooking } from './hooks';

const DESK_STATUS_MAP = {
  [DeskStatus.AVAILABLE]: 'available',
  [DeskStatus.PARTIALLY_RESERVED]: 'reserved',
  [DeskStatus.FULLY_RESERVED]: 'reserved',
  [DeskStatus.RESTRICTED]: 'restricted',
} as const;

function DeskList() {
  const { deskRequest } = useDeskContext();
  const { desks, isLoading, error } = useDesks(deskRequest);
  const { bookDesk, isBooking } = useDeskBooking();

  const mapDeskStatus = useCallback((deskStatus: DeskStatus): string => {
    return DESK_STATUS_MAP[deskStatus] ?? 'unknown';
  }, []);

  const getDeskStyle = useCallback(
    (status: DeskStatus) => ({
      margin: '5px 0',
      padding: '5px',
      ...(status === DeskStatus.AVAILABLE ? { border: '3px solid #28a745' } : { borderLeft: '3px solid #dc3545' }),
    }),
    [],
  );

  const handleBookDesk = useCallback(
    (deskId: string) => {
      bookDesk(deskRequest, deskId);
    },
    [bookDesk, deskRequest],
  );

  const renderDeskInfo = useCallback(
    (desk: Desk) => {
      const timeInfo = desk.startTime && desk.endTime ? ` (${desk.startTime} - ${desk.endTime})` : '';
      const isReserved = desk.status === DeskStatus.FULLY_RESERVED || desk.status === DeskStatus.PARTIALLY_RESERVED;
      const isAvailable = desk.status === DeskStatus.AVAILABLE;

      let reservationInfo = '';
      if (isReserved && desk.reservedBy) {
        reservationInfo = ` by ${desk.reservedBy}${timeInfo}`;
      } else if (isReserved) {
        reservationInfo = ' by private user';
      }

      return (
        <div key={desk.id} style={getDeskStyle(desk.status)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{desk.name}</strong> ({desk.location}) - id: {desk.id} - {mapDeskStatus(desk.status)}
              {reservationInfo}
            </div>
            {isAvailable && (
              <button
                onClick={() => handleBookDesk(desk.id.toString())}
                disabled={isBooking}
                style={{ marginLeft: '10px', padding: '5px 10px' }}
              >
                Book
              </button>
            )}
          </div>
        </div>
      );
    },
    [getDeskStyle, mapDeskStatus, handleBookDesk, isBooking],
  );

  if (error) {
    return (
      <div className="content-box">
        <div style={{ color: 'red' }}>{error.message}</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="content-box">
        <div>Loading desks...</div>
      </div>
    );
  }

  return <div className="content-box">{desks.map(renderDeskInfo)}</div>;
}

export default DeskList;
