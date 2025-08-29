import { ApiPath, httpClient } from '../lib/http-client';
import { logger } from '../lib/logger';
import { formatDate } from '../lib/date-utils';
import { ApiError } from '../lib/errors';
import {
  AuthHeaders,
  BaseRequest,
  BookingResult,
  Desk,
  DeskStatus,
  DeskTangoResponse,
  DeskView,
  Reservation,
  ReservationState,
  User,
} from '../types';
import { userService } from './user.service';
import { reservationService } from './reservation.service';

const serviceName = 'DeskService';
const MAX_BOOKING_DAYS_ADVANCE = 14;

const deskStatusMapping: Record<number, DeskStatus> = {
  1: DeskStatus.AVAILABLE,
  4: DeskStatus.PARTIALLY_RESERVED,
  5: DeskStatus.FULLY_RESERVED,
  6: DeskStatus.RESTRICTED,
};

class DeskService {
  // PUBLIC
  async bookDesk(deskRequest: BaseRequest): Promise<void> {
    const postData = this.createBookingPostData(deskRequest);
    if (!postData || postData.length == 0) return;
    await httpClient.request(
      httpClient.createOptions(ApiPath.BookDesk, deskRequest.userAuthHeaders),
      postData,
      serviceName,
    );
  }

  async autoBooking14daysAdvanced(user: User): Promise<void> {
    await this.autoBookingNthDaysAdvanced(user, MAX_BOOKING_DAYS_ADVANCE);
  }

  async autoBookingAllDaysAdvanced(user: User): Promise<BookingResult[]> {
    const results: BookingResult[] = [];
    for (let day = 1; day <= MAX_BOOKING_DAYS_ADVANCE; day++) {
      const result = await this.autoBookingNthDaysAdvanced(user, day);
      results.push(result);
    }
    return results;
  }

  async getDesks(deskRequest: BaseRequest): Promise<Desk[]> {
    const response: DeskTangoResponse = await this.fetchDesk(deskRequest);
    return (
      response?.views?.map((view: DeskView) => ({
        id: view.roomView.sysidResource,
        name: view.roomView.name,
        status: this.mapDeskStatus(view),
        reservedBy: view.reservationName ?? null,
        location: view.roomView.locationName,
        startTime: view.startTime
          ? `${view.startTime.hour.toString().padStart(2, '0')}:${view.startTime.minute.toString().padStart(2, '0')}`
          : null,
        endTime: view.endTime
          ? `${view.endTime.hour.toString().padStart(2, '0')}:${view.endTime.minute.toString().padStart(2, '0')}`
          : null,
      })) || []
    );
  }

  // PRIVATE
  private createPostData({
    userId,
    deskId = undefined,
    date = undefined,
    startHour = 0,
    startMinute = 0,
    endHour = 23,
    endMinute = 59,
  }: BaseRequest) {
    if (!userId) {
      throw new Error(`${serviceName} : \`userId\` is required`);
    }
    const dateObj: Date = new Date(date!);
    const year: number = dateObj?.getFullYear();
    const month: number = dateObj?.getMonth() + 1;
    const dayOfMonth: number = dateObj?.getDate();
    if (!year || !month || !dayOfMonth) {
      throw new Error(`${serviceName}: Cannot parse \`date\`: ${date}`);
    }
    const baseQuery = {
      startRow: 0,
      maxRows: -1,
      sortColumn: 'RESOURCE_NAME',
      sysidCategories: [2],
      discriminator: 'WKSP',
      sysidAllocRelationships: [2, 3],
      sysidUserAlloc: userId,
      sysidUserOwner: userId,
      sysidLocatorNode: 13,
      sysidLocationMapImages: [3],
      dates: [
        {
          startTime: {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            dayOfMonth: dateObj.getDate(),
            hour: startHour,
            minute: startMinute,
            tzIdValue: 'Asia/Saigon',
            discriminator: 'AqDate',
          },
          endTime: {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            dayOfMonth: dateObj.getDate(),
            hour: endHour,
            minute: endMinute,
            tzIdValue: 'Asia/Saigon',
            discriminator: 'AqDate',
          },
        },
      ],
    };
    if (deskId) {
      return { ...baseQuery, sysidResources: [deskId] };
    }
    return baseQuery;
  }

  private async fetchDesk(deskRequest: BaseRequest): Promise<DeskTangoResponse> {
    const postData = JSON.stringify(this.createPostData(deskRequest));
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.GetDesk, deskRequest.userAuthHeaders),
      postData,
      serviceName,
    );
    const response: DeskTangoResponse = JSON.parse(data);
    return response ?? [];
  }

  private mapDeskStatus(deskView: DeskView): DeskStatus {
    const status = deskStatusMapping[deskView.status] ?? DeskStatus.UNKNOWN;
    if (status === DeskStatus.UNKNOWN) {
      logger.warn(`Unknown desk status: ${deskView.status}, defaulting to "Unknown"`);
    }
    return status;
  }

  private async isDeskAvailable(deskRequest: BaseRequest): Promise<boolean> {
    const response: DeskTangoResponse = await this.fetchDesk(deskRequest);
    const status = this.mapDeskStatus(response?.views[0]);
    return status === DeskStatus.AVAILABLE;
  }

  private async autoBookingNthDaysAdvanced(user: User, days: number): Promise<BookingResult> {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + days);
    const formattedTargetDate = formatDate(targetDate);

    const userAuthHeaders = this.validateUserForAutoBooking(user);
    if (!userAuthHeaders) {
      return {
        date: formattedTargetDate,
        status: 'error',
        description: 'Invalid user authentication'
      };
    }

    return await this.processBookingForDay(user, userAuthHeaders, days);
  }

  private validateUserForAutoBooking(user: User): AuthHeaders | null {
    const userAuthHeaders = userService.getAuthHeadersByUserId(user.userId);
    if (!userAuthHeaders || !userService.isCurrentUserAuthValid(user.userId)) {
      logger.debug(`Auto-Booking: Skipping for user ${user.userName} because auth is invalid`);
      return null;
    }

    if (
      user.autoBookingDesksId.length === 0 ||
      user.autoBookingDesksId.length !== user.autoBookingDaysOfWeek.length ||
      user.autoBookingDesksId.length !== user.autoBookingDesksName.length
    ) {
      logger.warn(`Auto-Booking: Skipping for user ${user.userName} because desks is invalid`);
      return null;
    }

    return userAuthHeaders;
  }

  private async processBookingForDay(user: User, userAuthHeaders: AuthHeaders, advancedDay: number): Promise<BookingResult> {
    const today = new Date();
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + advancedDay);
    const formattedTargetDate = formatDate(targetDate);

    if (!user.autoBookingDaysOfWeek.includes(targetDate.getDay())) {
      logger.debug(
        `Auto-Booking: Skipping for user ${user.userName} as ${formattedTargetDate} is not in booking days ${user.autoBookingDaysOfWeek}`,
      );
      return {
        date: formattedTargetDate,
        status: 'skipped',
        description: 'Not a configured booking day'
      };
    }

    try {
      return await this.startBookingForDay(user, userAuthHeaders, targetDate);
    } catch (error: any) {
      if (error instanceof ApiError && error.statusCode === 401) {
        logger.error(`Auto-Booking: The user ${user.userId} - ${user.userName} Auth has been expired`);
        userService.clearUserAuthFields(user.userId);
      }
      logger.error(`Auto-Booking: Error for user ${user.userName} on ${formattedTargetDate}: ${error.message}`);
      return {
        date: formattedTargetDate,
        status: 'error',
        description: error.message
      };
    }
  }

  private async startBookingForDay(user: User, userAuthHeaders: AuthHeaders, targetDate: Date): Promise<BookingResult> {
    const request = this.mapToBaseRequest(user, userAuthHeaders, targetDate);
    const formattedTargetDate = formatDate(targetDate);

    const reservation: Reservation | undefined = await this.isUserBookedOnDate(request);
    if (reservation) {
      logger.debug(`Auto-Booking: ${user.userName} already has booked ${reservation.resourceName} on ${formattedTargetDate}`);
      return {
        date: formattedTargetDate,
        status: 'skipped',
        description: `Booked desk ${reservation.resourceName} on this date`
      };
    }

    if (!(await this.isDeskAvailable(request))) {
      logger.debug(`Auto-Booking: Desk ${request.deskName}-${request.deskId} is already booked for ${request.date}`);
      return {
        date: formattedTargetDate,
        status: 'error',
        description: `Desk ${request.deskName} is already booked`
      };
    }

    logger.info(
      `Auto-Booking: Booking desk ${request.deskName}-${request.deskId} for ${user.userName} on ${request.date}`,
    );
    await this.bookDesk(request);
    return {
      date: formattedTargetDate,
      status: 'success',
      description: `Booked desk ${request.deskName} successfully`
    };
  }

  private async isUserBookedOnDate(request: BaseRequest): Promise<Reservation | undefined> {
    const reservations = await reservationService.getReservationsForOneDate(request);
    return reservations.filter(
      (r) => r.state === ReservationState.AWAITING_CHECK_IN || r.state === ReservationState.CHECKED_IN,
    ).pop();
  }

  private mapToBaseRequest(user: User, userAuthHeaders: AuthHeaders, targetDate: Date): BaseRequest {
    const index = user.autoBookingDaysOfWeek.indexOf(targetDate.getDay());
    return {
      userId: user.userId,
      userAuthHeaders: userAuthHeaders,
      userName: user.userName,
      deskId: user.autoBookingDesksId[index] ?? 0,
      deskName: user.autoBookingDesksName[index] ?? undefined,
      date: formatDate(targetDate),
      startHour: user.startHour,
      startMinute: user.startMinute,
      endHour: user.endHour,
      endMinute: user.endMinute,
    };
  }

  private createBookingPostData({
    userId,
    deskId,
    date,
    startHour,
    startMinute,
    endHour,
    endMinute,
  }: BaseRequest): string {
    const missingParams = [];
    if (!userId) missingParams.push('userId');
    if (!date) missingParams.push('date');
    if (deskId === undefined || deskId === null) missingParams.push('deskId');
    if (startHour === undefined || startHour === null) missingParams.push('startHour');
    if (startMinute === undefined || startMinute === null) missingParams.push('startMinute');
    if (endHour === undefined || endHour === null) missingParams.push('endHour');
    if (endMinute === undefined || endMinute === null) missingParams.push('endMinute');
    if (missingParams.length !== 0) {
      throw new Error(`${serviceName} - createBookingPostData: Missing parameters: \`${missingParams.join('` `')}\``);
    }
    const user = userService.getUsers().filter((u) => u.userId === userId);
    if (user.length != 1) {
      throw new Error(`${serviceName} - createBookingPostData: Invalid user id ${userId}`);
    }
    const userName = user[0].userName;
    const dateObj: Date = new Date(date!);
    return JSON.stringify({
      sysidUserAlloc: userId,
      event: {
        name: userName,
        sysidEventOwner: userId,
        discriminator: 'STND',
        recurrenceRule: null,
        reservations: [
          {
            sysidUserOwner: userId,
            name: userName,
            sysidResource: deskId,
            discriminator: 'ROOM',
            sysidPurposeType: 1,
            aqStartTime: {
              year: dateObj.getFullYear(),
              month: dateObj.getMonth() + 1,
              dayOfMonth: dateObj.getDate(),
              hour: startHour,
              minute: startMinute,
              tzIdValue: 'Asia/Saigon',
              discriminator: 'AqDate',
            },
            aqEndTime: {
              year: dateObj.getFullYear(),
              month: dateObj.getMonth() + 1,
              dayOfMonth: dateObj.getDate(),
              hour: endHour,
              minute: endMinute,
              tzIdValue: 'Asia/Saigon',
              discriminator: 'AqDate',
            },
            privateResv: null,
            suppressEmails: false,
            children: [],
          },
        ],
      },
    });
  }
}

export const deskService = new DeskService();
