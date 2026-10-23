import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Board } from '../../boards/entities/board.entity';
import { Card } from '../../cards/entities/card.entity';
import { Message } from '../../messages/entities/message.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum UserStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  DELETED = 'deleted',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({
    nullable: true,
  })
  password: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING,
  })
  status: UserStatus;

  @Column({ nullable: true })
  verificationToken: string;

  @OneToMany(() => Board, (boards) => boards.user)
  boards: Board[];

  @OneToMany(() => Card, (cards) => cards.user)
  cards: Card[];

  @OneToMany(() => Message, (messages) => messages.user)
  messages: Message[];
}
