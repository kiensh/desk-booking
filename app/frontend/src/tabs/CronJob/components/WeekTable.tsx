import { BookingResult } from '../../../types';
import { formatDate } from '../utils/dateUtils';

const getStatusColor = (status: string) => {
  switch (status) {
    case 'success': return '#28a745';
    case 'error': return '#dc3545';
    default: return '#6c757d';
  }
};

const getDayOfWeek = (dateString: string) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString);
  return days[date.getDay()];
};

const isToday = (dateString: string) => {
  const today = formatDate(new Date());
  return dateString === today;
};

interface WeekTableProps {
  weekResults: BookingResult[];
}

export default function WeekTable({ weekResults }: Readonly<WeekTableProps>) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
        <tbody>
          <tr>
            {weekResults.map((result) => (
              <td
                key={result.date}
                style={{
                  border: '1px solid #ddd',
                  padding: '4px',
                  textAlign: 'center',
                  backgroundColor: isToday(result.date) ? '#007bff' : getStatusColor(result.status),
                  color: 'white',
                  fontWeight: 'bold',
                  width: '20%',
                }}
              >
                <div>{getDayOfWeek(result.date)}</div>
                <div>{result.date}</div>
              </td>
            ))}
          </tr>
          <tr>
            {weekResults.map((result) => (
              <td
                key={result.date}
                style={{
                  border: '1px solid #ddd',
                  padding: '4px',
                  textAlign: 'center',
                  backgroundColor: isToday(result.date) ? '#007bff' : getStatusColor(result.status),
                  color: 'white',
                  width: '20%',
                }}
              >
                {result.status}
                {isToday(result.date) && 'Today'}
              </td>
            ))}
          </tr>
          <tr>
            {weekResults.map((result) => (
              <td
                key={result.date}
                style={{
                  border: '1px solid #ddd',
                  padding: '4px',
                  textAlign: 'center',
                  backgroundColor: isToday(result.date) ? '#007bff' : getStatusColor(result.status),
                  color: 'white',
                  fontSize: '10px',
                  width: '20%',
                }}
              >
                {result.description}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}