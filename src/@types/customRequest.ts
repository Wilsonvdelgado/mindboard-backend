import { Request } from 'express';
import { UserAuth } from '../auth/auth.dto';
export interface MbRequest extends Request {
  user: UserAuth;
}
