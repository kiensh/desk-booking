import { httpClient, ApiPath } from '../lib/http-client';
import { AuthHeaders, User } from '../types';
import { logger } from '../lib/logger';
import { ApiError } from '../lib/errors';
import { userService } from './user.service';

const serviceName = 'AuthService';

class AuthService {
  async isAuthValid(authHeaders: AuthHeaders): Promise<boolean> {
    try {
      await httpClient.request(httpClient.createOptions(ApiPath.CheckUserAuth, authHeaders, 'GET'), '', serviceName);
      return true;
    } catch (error: any) {
      logger.error(error);
      return false;
    }
  }

  async isUserAuthValid(userId: number, authHeaders: AuthHeaders): Promise<boolean> {
    try {
      await userService.searchUserById(userId, authHeaders);
      return true;
    } catch (error: any) {
      logger.error(error?.message);
      return !(error instanceof ApiError && error.statusCode === 401);
    }
  }

  async autoCheckUserAuthFromCronConfig(user: User): Promise<void> {
    const userAuthHeaders = userService.getAuthHeadersByUserId(user.userId);
    if (!userAuthHeaders || !userService.isCurrentUserAuthValid(user.userId)) {
      logger.debug(`Auto-CheckUserAuth: User \`${user.userName}\` don't have any auth`);
      return;
    }

    const isValid = await this.isUserAuthValid(user.userId, userAuthHeaders);
    if (!isValid) {
      userService.clearUserAuthFields(user.userId);
      logger.debug(`Auto-CheckUserAuth: User \`${user.userName}\` has an expired auth (removed)`);
      return;
    }
    logger.debug(`Auto-CheckUserAuth: User \`${user.userName}\` has a valid auth`);
  }
}

export const authService = new AuthService();
