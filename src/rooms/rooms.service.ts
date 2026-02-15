import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateRoomDto, UpdateRoomDto } from './dto/room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room, RoomStatus } from './entities/room.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private roomRepository: Repository<Room>,
  ) {}

  create(data: CreateRoomDto) {
    const room = this.roomRepository.create({
      ...data,
      status: RoomStatus.ACTIVE,
    });
    return this.roomRepository.save(room);
  }

  findAll() {
    return this.roomRepository.find({
      where: {
        status: Not(RoomStatus.DELETED),
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const room = await this.roomRepository.findOneBy({
      id,
      status: Not(RoomStatus.DELETED),
    });
    if (!room) {
      throw new NotFoundException(`Sala não encontrada`);
    }
    return room;
  }

  async update(id: number, data: UpdateRoomDto) {
    const user = await this.findOne(id); // verifica se existe
    await this.roomRepository.update(id, {
      name: data.name ?? user.name,
      description: data.description ?? user.description,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id); // verifica se existe
    await this.roomRepository.update(id, {
      status: RoomStatus.DELETED,
    });
    return true;
  }
}
