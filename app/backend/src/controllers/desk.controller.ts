import { Request, Response } from 'express';
import { deskService } from '../services/desk.service';
import { userService } from '../services/user.service';
import { BaseRequest } from '../types';

export const getDeskHandler = async (req: Request, res: Response): Promise<void> => {
  const request: BaseRequest = { ...req.body, userAuthHeaders: req.userAuthHeaders, userId: req.userId };
  const desks = await deskService.getDesks(request);
  desks.sort((a, b) => {
    const getNumber = (name: string) => parseInt(RegExp(/W\.\d+\.(\d+)/).exec(name)?.[1] || '0');
    return getNumber(a.name) - getNumber(b.name);
  });
  res.json({ desks });
};

export const bookDeskHandler = async (req: Request, res: Response): Promise<void> => {
  const request: BaseRequest = { ...req.body, userAuthHeaders: req.userAuthHeaders, userId: req.userId };
  await deskService.bookDesk(request);
  res.json({ success: true });
};

export const bookAllDaysAdvancedHandler = async (req: Request, res: Response): Promise<void> => {
  const user = userService.getUsers().find((u) => u.userId === req.userId);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  const results = await deskService.autoBookingAllDaysAdvanced(user);
  res.json({ results });
};
