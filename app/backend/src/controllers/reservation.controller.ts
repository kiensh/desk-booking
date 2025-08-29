import { Request, Response } from 'express';
import { reservationService } from '../services/reservation.service';
import { BaseRequest } from '../types';

export const getReservationsHandler = async (req: Request, res: Response): Promise<void> => {
  const request: BaseRequest = { ...req.body, userAuthHeaders: req.userAuthHeaders, userId: req.userId };
  const reservations = await reservationService.getReservations(request);
  res.json({ reservations });
};

export const reservationActionHandler = async (req: Request, res: Response): Promise<void> => {
  const actionData = req.body;
  const result = await reservationService.changeReservationState(actionData, req.userAuthHeaders);
  res.json(result);
};
