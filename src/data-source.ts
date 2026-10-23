
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Board } from './boards/entities/board.entity';
import { Message } from './messages/entities/message.entity';
import { Card } from './cards/entities/card.entity';
import { User } from './users/entities/user.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [User,Board, Card, Message],
  migrations: ['src/migrations/*.ts'],
  synchronize: false,
});
