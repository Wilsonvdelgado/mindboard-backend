export class CreateMessageDto {
  boardId: number;
  content: string;
  userId?: number;
}

export class MessageDto {
  id: number;
  content: string;
  user: {
    id: number;
    name: string;
  };
}
