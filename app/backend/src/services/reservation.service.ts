import { httpClient, ApiPath } from '../lib/http-client';
import { logger } from '../lib/logger';
import { formatDate } from '../lib/date-utils';
import { ApiError } from '../lib/errors';
import {
  ActionData,
  ActionType,
  AuthHeaders,
  BaseRequest,
  User,
  Reservation,
  ReservationState,
  ReservationTangoRequest,
  ReservationTangoResponse,
  ReservationView,
} from '../types';
import { userService } from './user.service';

const serviceName = 'ReservationService';

const reservationStateMapping: Record<number, ReservationState> = {
  2: ReservationState.AWAITING_CHECK_IN,
  3: ReservationState.CHECKED_IN,
  5: ReservationState.EXPIRED,
  6: ReservationState.CANCELED_BY_ADMIN,
  7: ReservationState.CANCELED,
  8: ReservationState.CHECKED_OUT,
};

class ReservationService {
  async changeReservationState(actionData: ActionData, userAuthHeaders: AuthHeaders): Promise<any> {
    const postData = JSON.stringify({
      changes: [
        {
          sysidReservation: actionData.reservationId,
          sysidReservationActionType: actionData.actionType,
        },
      ],
    });
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.ChangeReservationState, userAuthHeaders, 'PUT'),
      postData,
      serviceName,
    );
    return JSON.parse(data);
  }

  async getReservations(request: BaseRequest): Promise<Reservation[]> {
    const response: ReservationTangoResponse = await this.fetchTangoReservations(request);
    return response?.views?.map((view) => this.mapToReservation(view)) ?? [];
  }

  async getReservationsForOneDate(request: BaseRequest): Promise<Reservation[]> {
    const response: ReservationTangoResponse = await this.fetchTangoReservationsForOneDate(request);
    return response?.views?.map((view) => this.mapToReservation(view)) ?? [];
  }

  async autoCheckInReservation(user: User): Promise<void> {
    const userAuthHeaders = userService.getAuthHeadersByUserId(user.userId);
    if (!userAuthHeaders || !userService.isCurrentUserAuthValid(user.userId)) {
      logger.debug(`Auto-CheckIn: Skipping for user ${user.userName} because auth is invalid`);
      return;
    }

    const today = new Date();
    if (!user.autoCheckInDaysOfWeek?.includes(today.getDay())) {
      const checkInDaysOfWeek = user.autoCheckInDaysOfWeek
        .filter((d) => d !== -1)
        .map(this.mapToDayOfWeek)
        .join(', ');
      logger.debug(
        `Auto-CheckIn: Skipping for user ${user.userName} because today is not a check-in day: ${checkInDaysOfWeek}`,
      );
      return;
    }

    const request: BaseRequest = this.mapToBaseRequest(user, userAuthHeaders, today);
    const reservations = await this.getReservationsForOneDate(request);
    const availableCheckInReservations = reservations.filter(
      (reservation) => reservation.checkInStatus === 'CHECK_IN' || reservation.checkInStatus === 'CHECK_IN_NO_ROLL',
    );

    if (availableCheckInReservations.length === 0) {
      logger.debug(`Auto-CheckIn: User ${user.userName} has no reservation to check in`);
    }

    if (availableCheckInReservations.length > 1) {
      logger.warn(`Auto-CheckIn: Multiple reservations found for ${user.userName} on ${today.toISOString()}`);
    }

    for (const reservation of availableCheckInReservations) {
      try {
        logger.info(`Auto-CheckIn: Start Check in for user ${user.userName}`);
        await this.changeReservationState(
          { reservationId: reservation.id, actionType: ActionType.CHECK_IN },
          userAuthHeaders,
        );
      } catch (error: any) {
        if (error instanceof ApiError && error.statusCode === 401) {
          userService.clearUserAuthFields(user.userId);
        }
        logger.error(error.message);
      }
    }
  }

  private async fetchTangoReservations(request: BaseRequest): Promise<ReservationTangoResponse> {
    const postData = this.createPostData(request);
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.GetReservation, request.userAuthHeaders),
      JSON.stringify(postData),
      serviceName,
    );
    return JSON.parse(data) ?? { views: [] };
  }

  private async fetchTangoReservationsForOneDate(request: BaseRequest): Promise<ReservationTangoResponse> {
    const postData = this.createPostData(request);
    postData.dates[0].endTime.dayOfMonth = postData.dates[0].startTime.dayOfMonth;
    postData.dates[0].startTime.hour = 0;
    postData.dates[0].startTime.minute = 0;
    postData.dates[0].endTime.hour = 23;
    postData.dates[0].endTime.minute = 59;
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.GetReservation, request.userAuthHeaders),
      JSON.stringify(postData),
      serviceName,
    );
    return JSON.parse(data) ?? { views: [] };
  }

  private mapReservationState(view: ReservationView): ReservationState {
    const status = reservationStateMapping[view.sysidReservationState] ?? ReservationState.UNKNOWN;
    if (status === ReservationState.UNKNOWN) {
      logger.warn(`Unknown desk status: ${view.sysidReservationState}, defaulting to "Unknown"`);
    }
    return status;
  }

  private mapToReservation(view: ReservationView): Reservation {
    return {
      id: view.sysidReservation.toString(),
      userName: view.reservationName,
      resourceName: view.resourceName,
      privateReservation: view.privateReservation,
      location: view.resourceLocations?.[0]?.locationName || 'Unknown',
      date: `${view.aqStartTime.dayOfMonth.toString().padStart(2, '0')}-${view.aqStartTime.month.toString().padStart(2, '0')}-${view.aqStartTime.year}`,
      startTime: `${view.aqStartTime.hour.toString().padStart(2, '0')}:${view.aqStartTime.minute.toString().padStart(2, '0')}`,
      endTime: `${view.aqEndTime.hour.toString().padStart(2, '0')}:${view.aqEndTime.minute.toString().padStart(2, '0')}`,
      state: this.mapReservationState(view),
      checkInStatus: view.checkInStatus || 'NONE',
    };
  }

  private createPostData({
    userId,
    userAuthHeaders,
    date,
    startHour = 0,
    startMinute = 0,
    endHour = 23,
    endMinute = 59,
  }: BaseRequest): ReservationTangoRequest {
    const dateObj: Date = new Date(date!);
    const year: number = dateObj?.getFullYear();
    const month: number = dateObj?.getMonth() + 1;
    const dayOfMonth: number = dateObj?.getDate();
    if (!year || !month || !dayOfMonth) {
      throw new Error(`${serviceName}: Cannot parse \`date\`: ${date}`);
    }
    if (!userId) {
      throw new Error(`${serviceName} - fetchTangoReservations: \`userId\` is required`);
    }
    if (!userAuthHeaders) {
      throw new Error(`${serviceName} - fetchTangoReservations: \`userAuthHeaders\` is required`);
    }
    return {
      maxRows: -1,
      dates: [
        {
          startTime: {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            dayOfMonth: dateObj.getDate(),
            hour: startHour,
            minute: startMinute,
            tzIdValue: 'Asia/Ho_Chi_Minh',
            discriminator: 'AqDate',
          },
          endTime: {
            year: dateObj.getFullYear(),
            month: dateObj.getMonth() + 1,
            dayOfMonth: dateObj.getDate() + 14,
            hour: endHour,
            minute: endMinute,
            tzIdValue: 'Asia/Ho_Chi_Minh',
            discriminator: 'AqDate',
          },
        },
      ],
      reservationStates: [],
      sysidUserOwners: [userId],
      sysidUserAlloc: userId,
      sysidUserCreators: [userId],
      usersArgsOred: true,
      sortAscending: true,
      sortColumn: 'START_TIME',
      sysidAllocRelationships: [],
      onlyParents: true,
    };
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

  private mapToDayOfWeek(day: number): string {
    const mapper: Record<number, string> = {
      [-1]: 'Unknown',
      1: 'Mon',
      2: 'Tue',
      3: 'Wed',
      4: 'Thu',
      5: 'Fri',
    };
    return mapper[day] ?? 'Unknown';
  }
}

export const reservationService = new ReservationService();
