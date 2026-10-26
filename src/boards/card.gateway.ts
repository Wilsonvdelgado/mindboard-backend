import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

import { CardsService } from '../cards/cards.service';
import { CardDto, UpdateCardPositionDto } from '../cards/dto/card.dto';
import { MessagesService } from '../messages/messages.service';
import { CreateMessageDto } from '../messages/dto/create-message.dto';
import { JwtService } from '@nestjs/jwt';
import { UserAuth } from '../auth/auth.dto';
  import { parseCookie } from 'cookie';



function getError(err: unknown) {
  const error = err instanceof Error ? err : new Error(String(err));
  return error?.message ?? 'Failed to get cards';
}

interface CustomSocket extends Socket {
  data: {
    user: { id: string; username: string }; // define o que guardas
  };
}

@WebSocketGateway({ cors: {
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST',  'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  } })
export class BoardGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly cardsService: CardsService,
    private readonly messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

   afterInit(server: Server) {
    server.use(async (client: Socket, next) => {
      try {
        const cookieHeader = client.handshake.headers.cookie ?? '';
        const cookies = parseCookie(cookieHeader);


        // Substitui pelo nome real do teu cookie HttpOnly.
        const token = cookies['access_token'];

        if (!token) {
          return next(new Error('Unauthorized'));
        }

        const user = await this.jwtService.verifyAsync<UserAuth>(token);

        client.data.user = user;

        next();
      } catch {
        next(new Error('Unauthorized'));
      }
    });
  }

  // handleConnection(client: Socket) {
  //   try {
  //     console.log('Client connected:', client.id);
  //     const token = client.handshake.headers.authorization?.replace(
  //       'Bearer ',
  //       '',
  //     );
  //     if (!token) throw new Error('No token');

  //     const user = this.jwtService.verify<UserAuth>(token);
  //     client.data.user = user; // salva o user no socket
  //   } catch (err) {
  //     client.disconnect(); // desconecta se não estiver autenticado
  //   }
  // }

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
        userId: +user.id,
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

  // // Atualizar posição
  // @SubscribeMessage('updateCardPosition')
  // async handleUpdatePosition(
  //   @MessageBody() data: { id: number; newPosition: number },
  // ) {
  //   // const updatedCard = await this.cardsService.updatePosition(
  //   //   data.id,
  //   //   data.newPosition,
  //   // );
  //   this.server.emit('cardUpdated', { updatedCard: 'sss' }); // notifica todos
  //   return 'updatedCard';
  // }

  // Pegar todos os cartões
  // @SubscribeMessage('getCards')
  // async handleGetCards() {
  //   const cards = await this.cardsService.findAll();
  //   return cards;
  // }
}
