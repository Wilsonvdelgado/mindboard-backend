import { PartialType } from '@nestjs/mapped-types';

export enum BoardStatus {
  ACTIVE = 'active',
  VOTING = 'vonting',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}

export class CreateBoardDto {
  name: string;
  description: string;
  userId?: number;
}

export class UpdateBoardDto extends PartialType(CreateBoardDto) {
  name: string;
  email: string;
}
