export class CardDto {
  boardId: number;
  description: string;
  userId?: number;
  color: string | null;
}

export enum CardStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}

export class UpdateCardPositionDto {
  id: number;
  newPosition: number;
  boardId?: number;
}

export class BoardCardDto {
  id: number;
  description: string;
  boardId: number;
  userName: string;
  position: number;
  color: string;
}
