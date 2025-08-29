import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';
import { User } from '../types';

export const loginHandler = async (req: Request, res: Response): Promise<void> => {
  const userId: number | null =
    (req.userId || (await userService.getUserByAuthHeader(req.userAuthHeaders))?.userId) ?? null;

  if (!userId) {
    if (req.body?.email) {
      const email: string = req.body.email;
      const users: User[] = await userService.searchUsersByEmail(email, req.userAuthHeaders);
      const user: User | null = users.length === 1 ? users[0] : null;

      if (user) {
        const isValid = await authService.isUserAuthValid(user.userId, req.userAuthHeaders);
        if (isValid) {
          await userService.updateUserAuthFields(user.userId, req.userAuthHeaders);
        }
        res.json({ valid: isValid, userId: user.userId, email: user.email });
        return;
      }
    }

    const isValid = await authService.isAuthValid(req.userAuthHeaders);
    res.json({ valid: isValid, userId: null, email: null });
    return;
  }

  const isValid = await authService.isUserAuthValid(userId, req.userAuthHeaders);
  let email: string | null = null;
  if (isValid) {
    await userService.updateUserAuthFields(userId, req.userAuthHeaders);
    email = userService.getUsers().find((u) => u.userId === userId)?.email ?? null;
  }
  res.json({ valid: isValid, userId: userId, email: email });
};

export const logoutHandler = async (req: Request, res: Response): Promise<void> => {
  userService.clearUserAuthFields(req.userId);
  res.json({ message: 'Logged out successfully' });
};
