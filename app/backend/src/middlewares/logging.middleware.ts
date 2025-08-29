import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';

const logResponse = (method: string, url: string, statusCode: number, duration: number): void => {
  const message = `${method} ${url} - ${statusCode} (${duration}ms)`;
  if (statusCode >= 400) logger.error(message);
  else if (statusCode >= 300) logger.debug(message);
  else logger.success(message);
};

export const loggingMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  if (req.method === 'GET' && req.path === '/logs') {
    next();
    return;
  }

  const startTime = Date.now();
  logger.debug(`${req.method} ${req.url}`);

  res.on('finish', () => {
    logResponse(req.method, req.url, res.statusCode, Date.now() - startTime);
  });
  next();
};
