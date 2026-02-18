import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { User } from '../../users/entities/user.entity';

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Board, (board) => board.messages, {
    onDelete: 'CASCADE', // Se o usuário for deletado, os quartos também serão
  })
  @JoinColumn({ name: 'boardId' }) // Nome da coluna da chave estrangeira no banco
  board: Board;

  @Column()
  boardId: number;

  @ManyToOne(() => User, (user) => user.messages, {
    onDelete: 'CASCADE', // Se o usuário for deletado, os quartos também serão
  })
  @JoinColumn({ name: 'userId' }) // Nome da coluna da chave estrangeira no banco
  user: User;

  @Column()
  userId: number;
}
