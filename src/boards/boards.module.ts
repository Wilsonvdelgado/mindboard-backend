import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from './entities/board.entity';
import { User } from '../users/entities/user.entity';
import { BoardGateway } from './card.gateway';
import { CardsModule } from '../cards/cards.module';
import { Message } from '../messages/entities/message.entity';
import { Card } from '../cards/entities/card.entity';
import { MessagesModule } from '../messages/messages.module';
import { AuthModule } from '../auth/auth.module';
import { SocketTicketService } from './socketTicket.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Board, User, Message, Card]),
    CardsModule,
    MessagesModule,
    AuthModule,
  ],
  controllers: [BoardsController],
  providers: [BoardsService, BoardGateway, SocketTicketService],
})
export class BoardsModule {}
