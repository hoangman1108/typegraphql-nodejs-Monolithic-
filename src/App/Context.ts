import { Request, Response } from 'express';
import { Logger } from 'pino';
import passport from 'passport';
import logger from '../Log';
import { IOptions } from '../type/passport';
import { IUser } from '../Models/user.model';
import { User } from '../Modules/User/type/user.type';

export interface IContext {
  req: Request;
  res: Response;
  authenticate?: any;
  logger: Logger;
  user: IUser;
}

export const Context = {
  logger,
  authenticate: (key: string, options: IOptions, req: Request, res: Response) => new Promise((resolve, reject) => {
    const done = (error: Error, user: User, info: any) => {
      if (error) reject(error);
      resolve({ user, info });
    };
    const auth = passport.authenticate(key, options, done);
    return auth(req, res);
  }),
};