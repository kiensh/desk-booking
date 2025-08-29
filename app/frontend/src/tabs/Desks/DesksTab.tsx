import DeskList from './DeskList';
import BookDesk from './BookDesk';
import { DeskProvider } from './context';

export interface DeskRequest {
  date: string;
  deskId: number;
  deskName: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

function DesksTabContent() {
  return (
    <div>
      <h3>Book a Desk</h3>
      <BookDesk />
      <h3>All Desks</h3>
      <DeskList />
    </div>
  );
}

function DesksTab() {
  return (
    <DeskProvider>
      <DesksTabContent />
    </DeskProvider>
  );
}

export default DesksTab;
