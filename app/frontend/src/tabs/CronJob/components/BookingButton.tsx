interface BookingButtonProps {
  isBooking: boolean;
  onBook: () => void;
}

export default function BookingButton({ isBooking, onBook }: Readonly<BookingButtonProps>) {
  return (
    <div>
      <h4>Book All Days</h4>
      <button
        onClick={onBook}
        disabled={isBooking}
        style={{
          padding: '8px 16px',
          border: 'none',
          borderRadius: '4px',
          cursor: isBooking ? 'not-allowed' : 'pointer',
        }}
      >
        {isBooking ? 'Processing...' : 'Process Booking 14 Days'}
      </button>
    </div>
  );
}