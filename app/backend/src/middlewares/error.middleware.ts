import { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger';
import { ApiError } from '../lib/errors';

export const errorMiddleware = (error: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error(error);
  if (res.headersSent) {
    return next(error);
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({ error: error.message });
  } else {
    res.status(500).json({ error: error.message ?? 'Internal server error' });
  }
};
