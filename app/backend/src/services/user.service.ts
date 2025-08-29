import { httpClient, ApiPath } from '../lib/http-client';
import { AuthHeaders, User, UserSearchByIdResponse, UserSearchResponse } from '../types';
import { logger } from '../lib/logger';
import { fileStorage } from '../lib/file-storage';

const serviceName = 'UserService';

class UserService {
  private readonly users: User[] = [];

  getUsers(): User[] {
    return this.users;
  }

  async loadUsersFromFile(): Promise<void> {
    try {
      const data = await fileStorage.loadUsers();
      this.users.splice(0, this.users.length, ...data);
    } catch (err: any) {
      logger.error('Failed to load users from file', { error: err.message });
    }
  }

  async saveUsersToFile(): Promise<void> {
    try {
      await fileStorage.saveUsers(this.users);
    } catch (err: any) {
      logger.error('Failed to save users', { error: err.message });
    }
  }

  clearUserAuthFields(userId: number): void {
    if (userId === 0) return;
    const user = this.users.find((u) => u.userId === userId);
    if (!user) {
      throw new Error('No user found');
    }
    user.appAuthToken = '';
    user.authorization = '';
    this.saveUsersToFile().then((_) => _);
  }

  async searchUsersByName(name: string, authHeaders: AuthHeaders): Promise<User[]> {
    if (name === undefined) {
      throw new Error('Missing field `name`');
    }
    const words = name.trim().split(/\s+/);
    const lastName = words.pop() ?? '';
    const firstName = words.length ? words.join(' ') : lastName;
    const postData = JSON.stringify({
      startRow: 0,
      maxRows: -1,
      firstName,
      lastName,
      sortColumn: 'LAST_NAME',
      sortAscending: true,
    });
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.SearchUserByName, authHeaders),
      postData,
      serviceName,
    );
    const response: UserSearchResponse = JSON.parse(data);
    return (
      response?.views?.map(
        (view) =>
          ({
            userId: view.sysidUser,
            userName: `${view.firstName} ${view.lastName}`,
            email: view.emailAddress,
          }) as User,
      ) ?? []
    );
  }

  async searchUserById(userId: number, authHeaders: AuthHeaders, silent: boolean = false): Promise<User | null> {
    if (!userId) return null;
    const postData = JSON.stringify({ sysidUser: userId });
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.SearchUserById, authHeaders),
      postData,
      silent ? 'UserService-Silent' : serviceName,
    );
    const response: UserSearchByIdResponse = JSON.parse(data);

    if (response?.profile && response?.business) {
      return {
        userId: response.profile.userId,
        userName: `${response.profile.firstName} ${response.profile.lastName}`,
        email: response.business.emailAddress,
        appAuthToken: authHeaders['AQOB-AppAuthToken'],
        authorization: authHeaders.Authorization,
        apiKey: authHeaders['x-api-key'],
        autoBookingDesksId: [-1, -1, -1, -1, -1],
        autoBookingDesksName: ['', '', '', '', ''],
        autoBookingDaysOfWeek: [-1, -1, -1, -1, -1],
        autoCheckInDaysOfWeek: [-1, -1, -1, -1, -1],
        startHour: 8,
        startMinute: 0,
        endHour: 17,
        endMinute: 0,
      } as User;
    }
    return null;
  }

  async searchUsersByEmail(email: string, authHeaders: AuthHeaders): Promise<User[]> {
    if (email === undefined || email === null || email.length === 0) {
      throw new Error('Missing field `email`');
    }
    const postData = JSON.stringify({
      startRow: 0,
      maxRows: -1,
      emailAddress: email,
      sysidStatuses: [3],
    });
    const data = await httpClient.request(
      httpClient.createOptions(ApiPath.SearchUser, authHeaders),
      postData,
      serviceName,
    );
    const response: UserSearchResponse = JSON.parse(data);
    return (
      response?.views?.map(
        (view) =>
          ({
            userId: view.sysidUser,
            userName: `${view.firstName} ${view.lastName}`,
            email: view.emailAddress,
          }) as User,
      ) ?? []
    );
  }

  async updateUserAuthFields(userId: number, authHeaders: AuthHeaders): Promise<void> {
    if (!userId) return;
    let user: User | null = this.users.find((u) => u.userId === userId) ?? null;
    if (user) {
      if (
        user.appAuthToken === authHeaders['AQOB-AppAuthToken'] &&
        user.authorization === authHeaders.Authorization &&
        user.apiKey === authHeaders['x-api-key']
      ) {
        return;
      }
      user.appAuthToken = authHeaders['AQOB-AppAuthToken'];
      user.authorization = authHeaders.Authorization;
      if (user.apiKey !== authHeaders['x-api-key']) {
        if (user.apiKey.length !== 0) {
          logger.warn(`User ${user.userId} has updated API key from ${user.apiKey} to ${authHeaders['x-api-key']}`);
        }
        user.apiKey = authHeaders['x-api-key'];
      }
      this.saveUsersToFile().then((_) => _);
      return;
    }

    user = await this.searchUserById(userId, authHeaders);
    if (user) {
      logger.info(`Add new user ${user.userName}`);
      this.users.push(user);
      this.saveUsersToFile().then((_) => _);
    }
  }

  isCurrentUserAuthValid(userId: number): boolean {
    const user = this.users.find((u) => u.userId === userId);
    return !!user && !!user.appAuthToken && !!user.authorization && !!user.apiKey;
  }

  getAuthHeadersByUserId(userId: number): AuthHeaders | null {
    const user = this.users.find((u) => u.userId === userId);
    if (!user) {
      return null;
    }
    return {
      'AQOB-AppAuthToken': user.appAuthToken,
      Authorization: user.authorization,
      'x-api-key': user.apiKey,
    };
  }

  async getUserByAuthHeader(authHeaders: AuthHeaders): Promise<User | null> {
    const filteredUsers = this.users.filter(
      (u) =>
        u.appAuthToken === authHeaders['AQOB-AppAuthToken'] &&
        u.authorization === authHeaders['Authorization'] &&
        u.apiKey === authHeaders['x-api-key'],
    );
    if (filteredUsers.length) {
      if (filteredUsers.length !== 1) {
        logger.warn(
          `Users ${filteredUsers.map((u) => u.userName).join(', ')} has duplicated auth for ${authHeaders.Authorization}`,
        );
      }
      return filteredUsers[0];
    }

    const promises = this.users.map((user) =>
      this.searchUserById(user.userId, authHeaders, true)
        .then((_) => user)
        .catch(() => null),
    );
    const results = await Promise.allSettled(promises);

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        await this.updateUserAuthFields(result.value.userId, authHeaders);
        return result.value;
      }
    }

    return null;
  }
}

export const userService = new UserService();
