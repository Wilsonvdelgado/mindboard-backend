import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserAuth } from './auth.dto';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserAuth => {
    const { user }: { user: UserAuth } = ctx.switchToHttp().getRequest();
    return user;
  },
);
