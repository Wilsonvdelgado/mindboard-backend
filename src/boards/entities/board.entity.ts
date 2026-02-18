import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Card } from '../../cards/entities/card.entity';
import { Message } from '../../messages/entities/message.entity';

@Entity('boards')
export class Board {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.boards, {
    onDelete: 'CASCADE', // Se o usuário for deletado, os quartos também serão
  })
  @JoinColumn({ name: 'userId' }) // Nome da coluna da chave estrangeira no banco
  user: User;

  @Column()
  userId: number;

  @Column()
  status: BoardStatus;

  @OneToMany(() => Card, (cards) => cards.board)
  cards: Card[];

  @OneToMany(() => Message, (messages) => messages.board)
  messages: Message[];

  // @OneToMany(() => Message, (message) => message.board)
  // messages: Message[];
}

export enum BoardStatus {
  ACTIVE = 'active',
  VOTING = 'vonting',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}
