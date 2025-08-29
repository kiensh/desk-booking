import { User } from '../types';
import { userService } from './user.service';

class CronService {
  getCronConfigs(): User[] {
    return userService.getUsers();
  }

  async updateCronConfig(config: User): Promise<void> {
    this.checkRequiredFields(config);
    this.checkDuplicatedBookingDays(config);
    let index = userService.getUsers().findIndex((u) => u.userId === config.userId);
    if (index === -1) {
      throw new Error('User not found');
    }
    this.updateUserConfig(index, config);
    await userService.saveUsersToFile();
  }

  private checkDuplicatedBookingDays(newConfig: User) {
    const existingBookings = new Set<string>();

    for (const user of userService.getUsers()) {
      if (user.userId === newConfig.userId) continue;
      for (let j = 0; j < user.autoBookingDesksId.length; j++) {
        if (user.autoBookingDaysOfWeek[j] === -1) continue;
        existingBookings.add(`${user.autoBookingDesksId[j]}-${user.autoBookingDaysOfWeek[j]}`);
      }
    }

    for (let i = 0; i < newConfig.autoBookingDesksId.length; i++) {
      const key = `${newConfig.autoBookingDesksId[i]}-${newConfig.autoBookingDaysOfWeek[i]}`;
      if (existingBookings.has(key)) {
        throw new Error(
          `Desk ${newConfig.autoBookingDesksName[i]} is already configured for auto-booking on the same day of the week`,
        );
      }
    }
  }

  private updateUserConfig(index: number, newConfig: User) {
    const users = userService.getUsers();
    users[index] = {
      ...users[index],
      userName: newConfig.userName ?? users[index].userName,
      autoBookingDesksId: newConfig.autoBookingDesksId ?? users[index].autoBookingDesksId,
      autoBookingDesksName: newConfig.autoBookingDesksName ?? users[index].autoBookingDesksName,
      autoBookingDaysOfWeek: newConfig.autoBookingDaysOfWeek ?? users[index].autoBookingDaysOfWeek,
      autoCheckInDaysOfWeek: newConfig.autoCheckInDaysOfWeek ?? users[index].autoCheckInDaysOfWeek,
      startHour: newConfig.startHour ?? users[index].startHour,
      startMinute: newConfig.startMinute ?? users[index].startMinute,
      endHour: newConfig.endHour ?? users[index].endHour,
      endMinute: newConfig.endMinute ?? users[index].endMinute,
    };
  }

  private checkRequiredFields(newConfig: User) {
    const missingFields: string[] = [];

    if (!newConfig.userId) missingFields.push('userId');
    if (!newConfig.userName) missingFields.push('userName');
    if (!newConfig.autoBookingDesksId) missingFields.push('autoBookingDesksId');
    if (!newConfig.autoBookingDesksName) missingFields.push('autoBookingDesksName');
    if (!newConfig.autoBookingDaysOfWeek) missingFields.push('autoBookingDaysOfWeek');

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    if (
      newConfig.autoBookingDaysOfWeek?.length !== newConfig.autoBookingDesksId?.length ||
      newConfig.autoBookingDaysOfWeek?.length !== newConfig.autoBookingDesksName?.length
    )
      throw new Error('Not Equal length of auto booking days and desks');
  }
}

export const cronService = new CronService();
