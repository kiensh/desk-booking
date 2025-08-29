import { ChangeEvent, useCallback, useState } from 'react';
import { useDeskContext } from './context';
import { useTimeOptions } from './hooks';

function formatDate(date: Date) {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function BookDesk() {
  const { deskRequest, setStartTime, setEndTime, currentDate, setCurrentDate } = useDeskContext();
  const timeOptions = useTimeOptions();
  const [inputValue, setInputValue] = useState<string>(formatDate(currentDate));

  const handleStartTimeChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setStartTime(event.target.value);
    },
    [setStartTime],
  );

  const handleEndTimeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setEndTime(event.target.value);
  };

  const handleDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);
    if (value) {
      setCurrentDate(new Date(value));
    }
  };

  return (
    <div className="content-box">
      <div style={{ marginBottom: '15px' }}>
        <label>
          <span>Select Date: </span>
          <input type="date" value={inputValue} onChange={handleDateChange} />
        </label>

        <div style={{ display: 'flex', gap: '10px', width: '50%' }}>
          <div style={{ flex: 1 }}>
            <p>Start Hour:</p>
            <select
              value={`${deskRequest.startHour}-${deskRequest.startMinute}`}
              onChange={handleStartTimeChange}
              style={{ width: '100%', padding: '8px' }}
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <p>End Hour:</p>
            <select
              value={`${deskRequest.endHour}-${deskRequest.endMinute}`}
              onChange={handleEndTimeChange}
              style={{ width: '100%', padding: '8px' }}
            >
              {timeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookDesk;
