export class CardDto {
  boardId: number;
  description: string;
  userId?: number;
}

export enum CardStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}
