import { PartialType } from '@nestjs/mapped-types';

export enum RoomStatus {
  ACTIVE = 'active',
  VOTING = 'vonting',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}

export class CreateRoomDto {
  name: string;
  description: string;
  userId?: number;
}

export class UpdateRoomDto extends PartialType(CreateRoomDto) {
  name: string;
  email: string;
}
