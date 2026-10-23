import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { Message } from './entities/message.entity';
import { User } from '../users/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Board } from '../boards/entities/board.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Message, User, Board])],
  controllers: [],
  providers: [MessagesService],
  exports: [MessagesService],
})
export class MessagesModule {}
