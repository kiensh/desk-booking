import { Request, Response, NextFunction } from 'express';
import { AuthHeaders } from '../types';
import { userService } from '../services/user.service';

declare global {
  namespace Express {
    interface Request {
      userAuthHeaders: AuthHeaders;
      userId: number;
    }
  }
}

const isGetLogsRequest = (req: Request): boolean => req.method === 'GET' && req.path === '/logs';
const isSearchUsersRequest = (req: Request): boolean => req.method === 'POST' && req.path === '/users/search';
const isLoginRequest = (req: Request): boolean => req.method === 'POST' && req.path === '/auth/login';
const isLogoutRequest = (req: Request): boolean => req.method === 'POST' && req.path === '/auth/logout';

export const extractAuthHeadersMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (isGetLogsRequest(req)) {
    next();
    return;
  }

  const appAuthToken = req.headers['aqob-appauthtoken'] as string;
  const authorization = req.headers['authorization'] as string;
  const apiKey = req.headers['x-api-key'] as string;
  const userId = Number(req.headers['user-id'] as string);

  const missingAuth: string[] = [];
  if (!appAuthToken) missingAuth.push('AQOB-AppAuthToken');
  if (!authorization) missingAuth.push('Authorization');
  if (!apiKey) missingAuth.push('x-api-key');
  if (!userId && !isLoginRequest(req) && !isSearchUsersRequest(req)) missingAuth.push('user-id');
  if (missingAuth.length !== 0) {
    res.status(401).json({ error: `Unauthorized: Missing header fields ${missingAuth.join(' - ')}` });
    return;
  }

  req.userAuthHeaders = {
    'AQOB-AppAuthToken': appAuthToken,
    Authorization: authorization,
    'x-api-key': apiKey,
  };
  req.userId = userId;
  next();
};

export const handleAuthResponseMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (isGetLogsRequest(req) || isLoginRequest(req) || isLogoutRequest(req)) {
    next();
    return;
  }

  const originalJson = res.json;
  const originalStatus = res.status;
  let statusCode = 200;

  res.status = function (code: number) {
    statusCode = code;
    return originalStatus.call(this, code);
  };

  res.json = function (data: any) {
    if (req.userId) {
      if (statusCode === 200) {
        userService
          .updateUserAuthFields(req.userId, req.userAuthHeaders)
          .catch((err) => console.error('Failed to update user auth fields:', err));
      } else if (statusCode === 401) {
        userService.clearUserAuthFields(req.userId);
      }
    }
    return originalJson.call(this, data);
  };

  next();
};
