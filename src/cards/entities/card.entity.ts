import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';

@Entity('cards')
export class Card {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @ManyToOne(() => Board, (board) => board.cards, {
    onDelete: 'CASCADE', // Se o usuário for deletado, os quartos também serão
  })
  @JoinColumn({ name: 'boardId' }) // Nome da coluna da chave estrangeira no banco
  board: Board;

  @Column()
  boardId: number;

  @Column()
  position: number;

  @ManyToOne(() => User, (user) => user.cards, {
    onDelete: 'CASCADE', // Se o usuário for deletado, os quartos também serão
  })
  @JoinColumn({ name: 'userId' }) // Nome da coluna da chave estrangeira no banco
  user: User;
  @Column()
  userId: number;

  @Column()
  status: CardStatus;

  @Column({ nullable: true })
  color: string;
}

export enum CardStatus {
  ACTIVE = 'active',
  DELETED = 'deleted',
}
