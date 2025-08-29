import { BookingResult } from '../../../types';
import { groupResultsByWeek, padWeekTo5Days } from '../utils/weekUtils';
import WeekTable from './WeekTable';

interface BookingResultsGridProps {
  results: BookingResult[];
}

export default function BookingResultsGrid({ results }: Readonly<BookingResultsGridProps>) {
  if (results.length === 0) return null;

  const weeks = groupResultsByWeek(results, padWeekTo5Days);

  return (
    <div>
      <h4>Booking Results</h4>
      {weeks.map((weekResults) => (
        <WeekTable key={weekResults[0].date} weekResults={weekResults} />
      ))}
    </div>
  );
}