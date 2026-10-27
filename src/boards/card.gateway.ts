import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import 'dotenv/config';

import { CardsService } from '../cards/cards.service';
import { CardDto, UpdateCardPositionDto } from '../cards/dto/card.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UserAuth } from '../auth/auth.dto';
import { parseCookie } from 'cookie';
import { SocketTicketService } from './socketTicket.service';

function getError(err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err));
  return error?.message ?? 'Failed to get cards';
}

interface CustomSocket extends Socket {
  data: {
    user: { id: number }; // define o que guardas
  };
}

console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  },
})
export class BoardGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly cardsService: CardsService,
    private readonly messagesService: MessagesService,
    private readonly socketTickets: SocketTicketService,
  ) {}

  afterInit(server: Server) {
    server.use(async (client: CustomSocket, next) => {
      try {
        const ticket = client.handshake.auth.ticket;

        if (typeof ticket !== 'string') {
          next(new Error('unauthorized'));
          return;
        }

        const auth = this.socketTickets.consume(ticket);

        if (auth === null) {
          next(new Error('unauthorized'));
          return;
        }

        client.data.user = { id: auth.userId };

        const delay = auth.jwtExpiresAt - Date.now();
        const timer = setTimeout(() => client.disconnect(true), delay);

        client.once('disconnect', () => clearTimeout(timer));

        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  



  // Join room de um quadro
  @SubscribeMessage('joinBoard')
  handleJoinBoard(
    @MessageBody() boardId: number,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(`board_${boardId}`);
  }

  // Pegar todos os cartões de um quadro
  @SubscribeMessage('getCards')
  async handleGetCards(@MessageBody() boardId: number) {
    const cards = await this.cardsService.findAll(boardId);
    return cards;
  }

  // Criar cartão em um quadro
  @SubscribeMessage('createCard')
  async handleCreateCard(
    @MessageBody() data: CardDto,
    @ConnectedSocket() client: CustomSocket,
  ) {
    try {
      const user = client.data.user;
      const newCard = await this.cardsService.create({
        ...data,
        userId: +user.id,
      });

      // Emite apenas para quem está no mesmo quadro
      this.server.to(`board_${data.boardId}`).emit('cardCreated', newCard);
      return true;
    } catch (err) {
      this.server.to(`board_${data.boardId}`).emit('errorCards', {
        message: getError(err),
      });
      return false;
    }
  }

  // Atualizar posição do cartão em um quadro
  @SubscribeMessage('updateCardPosition')
  async handleUpdatePosition(@MessageBody() data: UpdateCardPositionDto) {
    try {
      const updatedCard = await this.cardsService.updatePosition(
        data.id,
        data.newPosition,
      );

      const cards = await this.cardsService.findAll(updatedCard.boardId);

      this.server
        .to(`board_${data.boardId}`)
        .emit('cardPositionUpdated', cards);
      return true;
    } catch (error) {
      console.log('eerr', error);
      this.server.to(`board_${data.boardId}`).emit('errorCards', {
        message: getError(error),
      });
      return false;
    }
  }

  /*** message chat */

  // Criar cartão em um quadro
  @SubscribeMessage('createMessage')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: CustomSocket,
  ) {
    const user = client.data.user;

    try {
      const newCard = await this.messagesService.create({
        ...data,
        userId: user.id,
      });

      // Emite apenas para quem está no mesmo quadro
      this.server.to(`board_${data.boardId}`).emit('messageCreated', newCard);
      return true;
    } catch (err) {
      this.server.to(`board_${data.boardId}`).emit('errorCards', {
        message: getError(err),
      });
      return false;
    }
  }

  // Pegar todos os cartões de um quadro
  @SubscribeMessage('getMessages')
  async handleGetMessages(@MessageBody() boardId: number) {
    const data = await this.messagesService.findAll(boardId);
    return data;
  }
}
