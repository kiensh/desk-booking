import { Request, Response } from 'express';
import { cronService } from '../services/cron.service';
import { authService } from '../services/auth.service';
import { User } from '../types';

export const getCronConfigsHandler = async (req: Request, res: Response): Promise<void> => {
  if (!(await authService.isUserAuthValid(req.userId, req.userAuthHeaders))) {
    throw new Error('Invalid User Auth');
  }
  const cronConfigs = cronService.getCronConfigs();
  res.json({
    cronConfigs: cronConfigs.map(({ userId, appAuthToken, authorization, apiKey, ...cronConfig }) => cronConfig),
  });
};

export const addOrUpdateCronConfigHandler = async (req: Request, res: Response): Promise<void> => {
  if (!(await authService.isUserAuthValid(req.userId, req.userAuthHeaders))) {
    throw new Error('Invalid User Auth');
  }
  const config: User = { ...req.body, userId: req.userId };
  await cronService.updateCronConfig(config);
  res.json({ success: true });
};
