import { IsEmail, IsString } from 'class-validator';
import { UserRole } from '../users/user.dto';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

export class UserAuth {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}
