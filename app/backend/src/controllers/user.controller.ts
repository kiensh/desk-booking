import { Request, Response } from 'express';
import { userService } from '../services/user.service';

export const getUsersHandler = async (req: Request, res: Response): Promise<void> => {
  const users = userService.getUsers();
  res.json({
    users: users.map(({ appAuthToken, authorization, apiKey, ...user }) => ({
      ...user,
      authenticated: !!appAuthToken && !!authorization && !!apiKey,
    })),
  });
};

export const searchUsersHandler = async (req: Request, res: Response): Promise<void> => {
  const { name } = req.body;
  const users = await userService.searchUsersByName(name, req.userAuthHeaders);
  res.json({ users: users.map(({ appAuthToken, authorization, apiKey, ...user }) => user) });
};
