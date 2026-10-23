import { PartialType } from '@nestjs/mapped-types';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export class CreateUserDto {
  name: string;
  email: string;
  role: UserRole;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  name: string;
  email: string;
}

export class CreatePasswordDto {
  password: string;
  token: string;
}

export class ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}
