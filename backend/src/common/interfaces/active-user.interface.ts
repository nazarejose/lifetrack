import { Request } from 'express';

export interface ActiveUser {
  id: string;
  email: string;
}

export interface RequestWithUser extends Request {
  user: ActiveUser;
}