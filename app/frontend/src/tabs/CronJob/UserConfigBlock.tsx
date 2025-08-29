import { CronConfig } from '../../types';
import DayConfigBlock from './DayConfigBlock';
import { DayNames } from './utils';
import { TimeSelector } from './Components';
import { useCronJobContext } from './contexts/CronJobContext';

interface UserConfigBlockProps {
  config: CronConfig;
  isCurrentUser: boolean;
}

export default function UserConfigBlock({ config, isCurrentUser }: Readonly<UserConfigBlockProps>) {
  const { updateTime, updateUserName, handleSave, isSaving } = useCronJobContext();
  return (
    <div
      style={{
        margin: '20px 0',
        padding: '15px',
        border: '1px solid #ddd',
        borderRadius: '8px',
        backgroundColor: isCurrentUser ? '#e8f4f8' : 'white',
      }}
    >
      <div style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '15px' }}>
        {isCurrentUser ? (
          <label>
            <span>Display Name: </span>
            <input
              type="text"
              value={config.userName}
              onChange={(e) => updateUserName(e.target.value)}
              style={{
                fontSize: '18px',
                fontWeight: 'bold',
                border: '1px solid #ddd',
                borderRadius: '4px',
                padding: '8px 12px',
                backgroundColor: 'white',
                outline: 'none',
                transition: 'border-color 0.2s',
                maxWidth: '200px',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#007cba')}
              onBlur={(e) => (e.target.style.borderColor = '#ddd')}
            />
          </label>
        ) : (
          config.userName
        )}
        {` (${config.email})`}
      </div>

      {/* Time Settings */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '10px' }}>
          Time Settings (applies to all days)
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div>
            <label>
              {'Start Time: '}
              <TimeSelector
                disabled={!isCurrentUser}
                hour={config.startHour}
                minute={config.startMinute}
                onHourChange={(hour) => updateTime('startHour', hour)}
                onMinuteChange={(minute) => updateTime('startMinute', minute)}
              />
            </label>
          </div>
          <div>
            <label>
              {'End Time: '}
              <TimeSelector
                disabled={!isCurrentUser}
                hour={config.endHour}
                minute={config.endMinute}
                onHourChange={(hour) => updateTime('endHour', hour)}
                onMinuteChange={(minute) => updateTime('endMinute', minute)}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Days Configuration */}
      <div style={{ display: 'flex', gap: '10px' }}>
        {DayNames.map((day, dayIndex) => (
          <DayConfigBlock key={day} day={day} dayIndex={dayIndex} config={config} isCurrentUser={isCurrentUser} />
        ))}
      </div>

      {isCurrentUser && (
        <button onClick={handleSave} style={{ marginTop: '20px', padding: '10px 20px' }} disabled={isSaving}>
          {isSaving ? 'Saving...' : 'Save Configuration'}
        </button>
      )}
    </div>
  );
}
