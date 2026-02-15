import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Room } from '../../rooms/entities/room.entity';

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

  @OneToMany(() => Room, (rooms) => rooms.user)
  rooms: Room[];

  //   id           Int            @id @default(autoincrement())
  //   email        String         @unique
  //   name         String?
  //   password     String
  //   createdAt    DateTime       @default(now())
  //   status       UserStatus     @default(PENDING)
}
