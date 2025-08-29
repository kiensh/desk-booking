import { CronConfig, Desk } from '../../types';
import { DayNumbers } from './utils';

type DeskSelectorProps = {
  dayIndex: number;
  config: CronConfig;
  isCurrentUser: boolean;
  desks: Desk[];
  getConflictingUsers: (deskId: number, dayIndex: number) => string[];
  updateDesk: (dayIndex: number, value: string) => void;
};
export const DeskSelector = ({
  dayIndex,
  config,
  isCurrentUser,
  desks,
  getConflictingUsers,
  updateDesk,
}: DeskSelectorProps) => {
  const selectedDeskId = config.autoBookingDesksId[dayIndex];
  const isDisabled = !isCurrentUser || config.autoBookingDaysOfWeek[dayIndex] === -1;

  return (
    <select
      disabled={isDisabled}
      value={selectedDeskId ?? ''}
      onChange={(e) => updateDesk(dayIndex, e.target.value)}
      style={{
        width: '100%',
        marginTop: '5px',
        padding: '4px',
        fontSize: '12px',
        border: '1px solid #ccc',
        borderRadius: '4px',
      }}
    >
      <option value="">{isCurrentUser ? 'Select Desk' : 'No desk selected'}</option>
      {isCurrentUser ? (
        desks.map((desk) => {
          const conflicts = getConflictingUsers(desk.id, DayNumbers[dayIndex]);
          return (
            <option key={desk.id} value={desk.id} disabled={conflicts.length > 0}>
              {desk.name}
              {conflicts.length > 0 && ` - Taken by ${conflicts.join(', ')}`}
            </option>
          );
        })
      ) : (
        <option value={selectedDeskId}>{config.autoBookingDesksName[dayIndex]}</option>
      )}
      <option hidden={true} value={selectedDeskId > 0 ? selectedDeskId : ''}>
        Loading...
      </option>
    </select>
  );
};

type ToggleButtonProps = {
  onClick?: () => void;
  isOn: boolean;
  disabled: boolean;
};
const ToggleButton = ({ onClick, isOn, disabled }: ToggleButtonProps) => (
  <button
    disabled={disabled}
    onClick={onClick}
    style={{
      width: '32px',
      height: '16px',
      backgroundColor: isOn ? '#007cba' : '#ccc',
      borderRadius: '8px',
      position: 'relative',
      cursor: disabled ? 'default' : 'pointer',
      margin: '0 8px 0 0',
      transition: 'background-color 0.2s',
      border: 'none',
      padding: '0',
    }}
  >
    <div
      style={{
        width: '12px',
        height: '12px',
        backgroundColor: 'white',
        borderRadius: '50%',
        position: 'absolute',
        top: '2px',
        left: isOn ? '18px' : '2px',
        transition: 'left 0.2s',
      }}
    />
  </button>
);

type AutoBookingToggleProps = {
  dayIndex: number;
  config: CronConfig;
  isCurrentUser: boolean;
  updateAutoBooking: (dayIndex: number, value: boolean) => void;
};
export const AutoBookingToggle = ({ isCurrentUser, dayIndex, config, updateAutoBooking }: AutoBookingToggleProps) => {
  const isOn = config.autoBookingDaysOfWeek.includes(DayNumbers[dayIndex]);
  return <ToggleButton disabled={!isCurrentUser} onClick={() => updateAutoBooking(dayIndex, !isOn)} isOn={isOn} />;
};

type AutoCheckInToggleProps = {
  dayIndex: number;
  config: CronConfig;
  isCurrentUser: boolean;
  updateAutoCheckIn: (dayIndex: number, value: boolean) => void;
};
export const AutoCheckInToggle = ({ isCurrentUser, dayIndex, config, updateAutoCheckIn }: AutoCheckInToggleProps) => {
  const isOn = config.autoCheckInDaysOfWeek.includes(DayNumbers[dayIndex]);
  return <ToggleButton disabled={!isCurrentUser} onClick={() => updateAutoCheckIn(dayIndex, !isOn)} isOn={isOn} />;
};

type TimeSelectorProps = {
  disabled: boolean;
  hour: number;
  minute: number;
  onHourChange: (hour: number) => void;
  onMinuteChange: (minute: number) => void;
};
export const TimeSelector = ({ disabled, hour, minute, onHourChange, onMinuteChange }: TimeSelectorProps) => (
  <select
    disabled={disabled}
    value={`${hour}-${minute}`}
    onChange={(e) => {
      const [h, m] = e.target.value.split('-').map(Number);
      onHourChange(h);
      onMinuteChange(m);
    }}
    style={{ padding: '8px', width: '120px' }}
  >
    {Array.from({ length: 24 }, (_, h) =>
      [0, 15, 30, 45].map((m) => (
        <option key={`${h}-${m}`} value={`${h}-${m}`}>
          {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}
        </option>
      )),
    ).flat()}
  </select>
);
