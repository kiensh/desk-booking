import fs from 'fs/promises';
import { config } from '../config';
import { logger } from './logger';
import { User } from '../types';

class FileStorage {
  private readonly usersFile = `${config.dataPath}/data.json`;

  async loadUsers(): Promise<User[]> {
    try {
      logger.info(`Loading Users from file: ${this.usersFile}`);
      const data = await fs.readFile(this.usersFile, 'utf-8');
      return JSON.parse(data);
    } catch (error: any) {
      if (error.code === 'ENOENT') {
        await fs.mkdir(config.dataPath, { recursive: true });
        await fs.writeFile(this.usersFile, '[]');
        return [];
      }
      throw error;
    }
  }

  async saveUsers(users: User[]): Promise<void> {
    logger.info(`Saving Users to file: ${this.usersFile}`);
    const jsonString = JSON.stringify(users, null, 2)
      .replace(/"autoBookingDesksId": \[\s*([-\d,\s]+)\s*]/g, (_, content) => {
        const numbers = content.match(/[-\d]+/g) ?? [];
        return `"autoBookingDesksId": [${numbers.join(', ')}]`;
      })
      .replace(/"autoBookingDesksName": \[\s*([-"\w.,\s]+)\s*]/g, (_, content) => {
        const names = content.match(/"[^"]*"/g) ?? [];
        return `"autoBookingDesksName": [${names.join(', ')}]`;
      })
      .replace(/"autoBookingDaysOfWeek": \[\s*([-\d,\s]+)\s*]/g, (_, content) => {
        const numbers = content.match(/[-\d]+/g) ?? [];
        return `"autoBookingDaysOfWeek": [${numbers.join(', ')}]`;
      })
      .replace(/"autoCheckInDaysOfWeek": \[\s*([-\d,\s]+)\s*]/g, (_, content) => {
        const numbers = content.match(/[-\d]+/g) ?? [];
        return `"autoCheckInDaysOfWeek": [${numbers.join(', ')}]`;
      });
    await fs.writeFile(this.usersFile, jsonString);
  }
}

export const fileStorage = new FileStorage();
