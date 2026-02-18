import { Injectable } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './entities/message.entity';
import { Repository } from 'typeorm';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private repository: Repository<Message>,
  ) {}

  async create(data: CreateMessageDto) {
    const message = this.repository.create(data);
    const { id } = await this.repository.save(message);

    const savedMessage = await this.repository.findOne({
      where: { id },
      relations: {
        user: true,
      },
      select: {
        id: true,
        content: true,
        user: {
          id: true,
          name: true,
        },
      },
    });

    console.log('savedMessage', savedMessage);
    return savedMessage;
  }

  async findAll(boardId: number) {
    const data = await this.repository.find({
      where: {
        boardId,
      },
      order: {
        id: 'ASC',
      },
      relations: { user: true },
      select: {
        id: true,
        content: true,
        user: {
          id: true,
          name: true,
        },
      },
    });
    return data;
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} message`;
  // }

  // update(id: number, updateMessageDto: UpdateMessageDto) {
  //   return `This action updates a #${id} message`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} message`;
  // }
}
