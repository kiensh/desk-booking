import { Request, Response, NextFunction } from 'express';

export const asyncRoute = (handler: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
