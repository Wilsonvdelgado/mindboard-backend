import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { MbRequest } from '../@types/customRequest';

interface AuthResponse extends Response {
  clearCookie(name: string, options?: any): void;
}

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@Req() req: MbRequest) {
    return req.user;
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: AuthResponse) {
    res?.clearCookie('jwt');
    return true;
  }
}
