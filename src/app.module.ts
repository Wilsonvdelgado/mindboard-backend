import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { User } from './users/entities/user.entity';
import { BoardsModule } from './boards/boards.module';
import { Board } from './boards/entities/board.entity';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { Card } from './cards/entities/card.entity';
import { MessagesModule } from './messages/messages.module';
import { Message } from './messages/entities/message.entity';
import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { ConfigModule } from '@nestjs/config';
import 'dotenv/config';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT ?? 5432),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [User, Board, Card, Message],
      synchronize: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com', // ou outro servidor SMTP
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      },
      defaults: {
        from: '"MaindBoard" <app.react.testmail@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), 'templates'),
        adapter: new HandlebarsAdapter(), // Pode usar outro template engine
        options: {
          strict: true,
        },
      },
    }),
    UsersModule,
    BoardsModule,
    AuthModule,
    CardsModule,
    MessagesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
