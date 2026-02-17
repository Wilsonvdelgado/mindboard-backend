import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Board, BoardStatus } from './entities/board.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class BoardsService {
  constructor(
    @InjectRepository(Board)
    private boardRepository: Repository<Board>,
  ) {}

  create(data: CreateBoardDto) {
    const board = this.boardRepository.create({
      ...data,
      status: BoardStatus.ACTIVE,
    });
    return this.boardRepository.save(board);
  }

  findAll() {
    return this.boardRepository.find({
      where: {
        status: Not(BoardStatus.DELETED),
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const board = await this.boardRepository.findOneBy({
      id,
      status: Not(BoardStatus.DELETED),
    });
    if (!board) {
      throw new NotFoundException(`Sala não encontrada`);
    }
    return board;
  }

  async update(id: number, data: UpdateBoardDto) {
    const board = await this.findOne(id); // verifica se existe
    await this.boardRepository.update(id, {
      name: data.name ?? board.name,
      description: data.description ?? board.description,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id); // verifica se existe
    await this.boardRepository.update(id, {
      status: BoardStatus.DELETED,
    });
    return true;
  }
}
