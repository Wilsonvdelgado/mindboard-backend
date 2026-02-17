import { Request } from 'express';
import { UserAuth } from '../auth/auth.dto';

export type MbRequest = Request & {
  user: UserAuth;
};
