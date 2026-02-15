import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @ManyToOne(() => User, (user) => user.rooms, {
    onDelete: 'CASCADE', // Se o usuário for deletado, os quartos também serão
  })
  @JoinColumn({ name: 'userId' }) // Nome da coluna da chave estrangeira no banco
  user: User;

  @Column()
  userId: number;

  @Column()
  status: RoomStatus;
}

export enum RoomStatus {
  ACTIVE = 'active',
  VOTING = 'vonting',
  COMPLETED = 'completed',
  DELETED = 'deleted',
}
