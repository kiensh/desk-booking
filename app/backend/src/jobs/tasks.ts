import { logger } from '../lib/logger';
import { userService } from '../services/user.service';
import { deskService } from '../services/desk.service';
import { reservationService } from '../services/reservation.service';
import { authService } from '../services/auth.service';

export async function autoBookingJob(): Promise<void> {
  logger.magenta(`Auto-Booking: Running job...`);
  const tasks: Promise<void>[] = [];
  userService.getUsers().forEach((user) => {
    tasks.push(deskService.autoBooking14daysAdvanced(user));
  });
  await Promise.all(tasks);
  logger.magenta(`Auto-Booking: Completed job`);
}

export async function autoCheckInJob(): Promise<void> {
  logger.magenta(`Auto-CheckIn: Running job...`);
  const tasks: Promise<void>[] = [];
  userService.getUsers().forEach((user) => {
    tasks.push(reservationService.autoCheckInReservation(user));
  });
  await Promise.all(tasks);
  logger.magenta(`Auto-CheckIn: Completed job`);
}

export async function autoCheckUserAuthJob(): Promise<void> {
  logger.magenta(`Auto-CheckUserAuth: Running job...`);
  const tasks: Promise<void>[] = [];
  userService.getUsers().forEach((user) => {
    tasks.push(authService.autoCheckUserAuthFromCronConfig(user));
  });
  await Promise.all(tasks);
  logger.magenta(`Auto-CheckUserAuth: Completed job`);
}
