export interface User {
  userId: number;
  userName: string;
  email: string;
  appAuthToken: string;
  authorization: string;
  apiKey: string;

  autoBookingDesksId: number[];
  autoBookingDesksName: string[];
  autoBookingDaysOfWeek: number[]; // 1-5 Mon-Fri
  autoCheckInDaysOfWeek: number[]; // 1-5 Mon-Fri
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
}

export interface BaseRequest {
  userId: number;
  userAuthHeaders: AuthHeaders;
  userName?: string;
  deskId?: number;
  deskName?: string;
  date?: string;
  startHour?: number;
  startMinute?: number;
  endHour?: number;
  endMinute?: number;
}

export interface Desk {
  id: number;
  name: string;
  status: DeskStatus;
  reservedBy: string | null;
  location: string;
  startTime: string | null;
  endTime: string | null;
}

export enum DeskStatus {
  AVAILABLE = 'available',
  PARTIALLY_RESERVED = 'partially_reserved',
  FULLY_RESERVED = 'fully_reserved',
  RESTRICTED = 'restricted',
  UNKNOWN = 'unknown',
}

export interface Reservation {
  id: string;
  userName: string;
  resourceName: string;
  privateReservation: boolean;
  location: string;
  date: string;
  startTime: string;
  endTime: string;
  state: ReservationState;
  checkInStatus: string;
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

export interface AqDate {
  discriminator: string;
  year: number;
  month: number;
  dayOfMonth: number;
  hour: number;
  minute: number;
  tzIdValue: string;
  noEndDate?: boolean;
}

export interface ReservationDateRange {
  startTime: AqDate;
  endTime: AqDate;
}

export interface ReservationTangoRequest {
  maxRows: number;
  dates: ReservationDateRange[];
  reservationStates: number[];
  sysidUserOwners: number[];
  sysidUserAlloc: number;
  sysidUserCreators: number[];
  usersArgsOred: boolean;
  sortAscending: boolean;
  sortColumn: string;
  sysidAllocRelationships: number[];
  onlyParents: boolean;
}

export interface RoomView {
  discriminator: string;
  sysidResource: number;
  name: string;
  sysidCategory: number;
  sysidResourceType: number;
  typeDescription: string;
  setupMinutes: number;
  breakDownMinutes: number;
  chargeCodeType: number;
  minChargeCodeRequired: number;
  sysidStatus: number;
  minDurationMinutes: number;
  maxDurationMinutes: number | null;
  price: number | null;
  sysidCurrencyType: number | null;
  sysidCostUnitType: number | null;
  allocRelationship: number;
  maxFutureReservationDays: number;
  leadTimeMinutes: number;
  images: any[];
  sysidVenueNode: number;
  venueName: string;
  sysidLocatorNode: number;
  locationName: string;
  capacity: number;
  backToBackMinutes: number;
  reqCheckIn: boolean;
  identities: any[];
  mapImageLocators: any[];
  sysidResourceGroups: any[];
}

export interface DeskView {
  status: number;
  roomView: RoomView;
  exhaustibleView: any;
  sysidReservation: number | null;
  reservationName: string | null;
  ownerFirstName: string | null;
  ownerLastName: string | null;
  startTime: AqDate | null;
  endTime: AqDate | null;
  privateReservation: boolean | null;
}

export interface DeskTangoResponse {
  hasAdditional: boolean;
  count: number;
  nextStartRow: number;
  views: DeskView[];
}

export interface ResourceLocation {
  sysidLocatorNode: number;
  sysidVenueNode: number;
  venueName: string;
  locationName: string;
  address1: string;
  address2: string | null;
  city: string;
  stateProvince: string | null;
  postalCode: string;
  country: string;
}

export interface ReservationView {
  discriminator: string;
  sysidReservation: number;
  confirmationNumber: number;
  sysidParentReservation: number | null;
  sysidDependentReservation: number | null;
  reservationName: string;
  sysidEventType: number;
  sysidColorCode: number | null;
  sysidDurationType: number;
  sysidOrgDurationType: number;
  sysidReservationState: number;
  sysidPurposeType: number;
  privateReservation: boolean;
  reservationComments: string | null;
  reservationEmailComments: string | null;
  sysidResource: number;
  sysidAccountResource: number;
  resourceName: string;
  sysidResourceAccount: number;
  sysidCategory: number;
  resourceCategoryName: string;
  sysidResourceType: number;
  resourceTypeName: string;
  resourceImage: string | null;
  resourceThumbnail: string | null;
  leadTimeMinutes: number;
  setupMinutes: number;
  breakDownMinutes: number;
  sysidCreator: number;
  sysidOwner: number;
  ownerFirstName: string;
  ownerMiddleInitial: string;
  ownerLastName: string;
  privateProfile: boolean;
  ownerPhone: string | null;
  children: any[];
  resourceLocations: ResourceLocation[];
  aqStartTime: AqDate;
  aqEndTime: AqDate;
  aqActiveStartTime: AqDate | null;
  aqActiveEndTime: AqDate | null;
  aqSetupTime: AqDate;
  aqBreakDownTime: AqDate;
  aqCreatedTime: AqDate;
  waitlistable: boolean;
  locationMapImageLocators: any[];
  numberOfAttendees: number;
  capacity: number;
  reqCheckIn: boolean;
  checkInStatus: string;
  aqLastCheckinTime: AqDate | null;
}

export interface ReservationTangoResponse {
  hasAdditional: boolean;
  nextStartRow: number;
  count: number;
  views: ReservationView[];
}

export interface ActionData {
  reservationId: string;
  actionType: ActionType;
}

export enum ActionType {
  CANCEL = 3,
  CHECK_IN = 5,
  CHECK_OUT = 6,
}

export interface AuthHeaders {
  'AQOB-AppAuthToken': string;
  Authorization: string;
  'x-api-key': string;
}

export interface RequestOptions {
  hostname: string;
  path: string;
  method: string;
  headers: Record<string, string>;
}

export interface UserProfile {
  userId: number;
  firstName: string;
  lastName: string;
  preferredName: string;
  middleInitial: string;
}

export interface UserBusiness {
  emailAddress: string;
  sysidRole: number;
}

export interface UserSearchByIdResponse {
  profile: UserProfile;
  business: UserBusiness;
}

export interface UserSearchView {
  sysidUser: number;
  firstName: string;
  lastName: string;
  emailAddress: string;
}

export interface UserSearchResponse {
  views: UserSearchView[];
}

export interface BookingResult {
  date: string;
  status: 'skipped' | 'success' | 'error';
  description: string;
}
