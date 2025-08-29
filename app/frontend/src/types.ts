export enum DeskStatus {
  AVAILABLE = 'available',
  PARTIALLY_RESERVED = 'partially_reserved',
  FULLY_RESERVED = 'fully_reserved',
  RESTRICTED = 'restricted',
}

export interface Desk {
  id: number;
  name: string;
  location: string;
  status: DeskStatus;
  reservedBy?: string;
  startTime?: string;
  endTime?: string;
}

export enum ReservationState {
  AWAITING_CHECK_IN = 'awaiting-check-in',
  CHECKED_IN = 'checked-in',
  EXPIRED = 'expired',
  CANCELED_BY_ADMIN = 'canceled-by-admin',
  CANCELED = 'canceled',
  CHECKED_OUT = 'checked-out',
  UNKNOWN = 'unknown',
}

export interface Reservation {
  id: string;
  userName: string;
  resourceName: string;
  privateReservation: string;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  state: ReservationState;
  checkInStatus: string;
}

export interface SearchUser {
  userId: string;
  userName: string;
  email: string;
}

export interface Status {
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface TimeOption {
  value: string;
  label: string;
}

export interface Tab {
  id: string;
  label: string;
  component: React.ComponentType;
}

export interface AuthHeaders {
  'AQOB-AppAuthToken': string;
  Authorization: string;
  'x-api-key': string;
}

export interface User {
  userId: number;
  email: string;
  appAuthToken: string;
  authorization: string;
  apiKey: string;
}

export enum ActionType {
  CANCEL = 3,
  CHECK_IN = 5,
  CHECK_OUT = 6,
}

export interface CronConfig {
  userName: string;
  email: string;
  autoBookingDesksId: number[];
  autoBookingDesksName: string[];
  autoBookingDaysOfWeek: number[];
  autoCheckInDaysOfWeek: number[];
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface BookingResult {
  date: string;
  status: 'skipped' | 'success' | 'error';
  description: string;
}

export interface BookAllDaysResponse {
  results: BookingResult[];
}
