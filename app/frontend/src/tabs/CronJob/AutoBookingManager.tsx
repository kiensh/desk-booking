import { useApiRequest } from '../../contexts/useApiRequest';
import { useToast } from '../../contexts/ToastContext';
import { BookAllDaysResponse, BookingResult } from '../../types';
import { useState } from 'react';
import BookingButton from './components/BookingButton';
import BookingResultsGrid from './components/BookingResultsGrid';

export default function AutoBookingManager() {
  const apiRequest = useApiRequest();
  const { showToast } = useToast();
  const [isBooking, setIsBooking] = useState(false);
  const [bookingResults, setBookingResults] = useState<BookingResult[]>([]);

  const handleBookAllDays = async () => {
    setIsBooking(true);
    try {
      const response = await apiRequest('/api/desks/book-all-days', { method: 'POST' });
      const data: BookAllDaysResponse = await response.json();
      setBookingResults(data.results);
    } catch (error: any) {
      showToast(`Failed to book all days: ${error.message}`, 'error');
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <BookingButton isBooking={isBooking} onBook={handleBookAllDays} />
      <BookingResultsGrid results={bookingResults} />
    </div>
  );
}