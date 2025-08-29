import { CronConfig } from '../../types';
import { DeskSelector, AutoBookingToggle, AutoCheckInToggle } from './Components';
import { DayNumbers } from './utils';
import { useCronJobContext } from './contexts/CronJobContext';

interface DayConfigBlockProps {
  day: string;
  dayIndex: number;
  config: CronConfig;
  isCurrentUser: boolean;
}

export default function DayConfigBlock({ day, dayIndex, config, isCurrentUser }: Readonly<DayConfigBlockProps>) {
  const { desks, getConflictingUsers, updateDesk, updateAutoBooking, updateAutoCheckIn } = useCronJobContext();
  const indexOfDay = config.autoBookingDaysOfWeek.indexOf(DayNumbers[dayIndex]);
  const selectedDeskId = config.autoBookingDesksId[indexOfDay];
  const conflictingUsers =
    isCurrentUser && selectedDeskId ? getConflictingUsers(selectedDeskId, DayNumbers[dayIndex]) : [];
  const hasConflict = isCurrentUser && conflictingUsers.length > 0;

  return (
    <div
      style={{
        width: '18%',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: hasConflict ? '#fff3cd' : 'white',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '10px', fontSize: '14px' }}>{day}</div>

      <div style={{ display: 'flex', marginBottom: '10px' }}>
        <label>
          <span>Desk: </span>
          <DeskSelector
            dayIndex={dayIndex}
            config={config}
            isCurrentUser={isCurrentUser}
            desks={desks}
            getConflictingUsers={getConflictingUsers}
            updateDesk={updateDesk}
          />
        </label>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
          <AutoBookingToggle
            dayIndex={dayIndex}
            config={config}
            isCurrentUser={isCurrentUser}
            updateAutoBooking={updateAutoBooking}
          />
          Auto Booking
        </label>
      </div>

      <div>
        <label style={{ display: 'flex', alignItems: 'center', fontSize: '12px' }}>
          <AutoCheckInToggle
            dayIndex={dayIndex}
            config={config}
            isCurrentUser={isCurrentUser}
            updateAutoCheckIn={updateAutoCheckIn}
          />
          Auto Check-in
        </label>
      </div>

      {hasConflict && (
        <div style={{ marginTop: '10px', fontSize: '12px', color: '#856404' }}>
          ⚠️ Conflict with: {conflictingUsers.join(', ')}
        </div>
      )}
    </div>
  );
}
