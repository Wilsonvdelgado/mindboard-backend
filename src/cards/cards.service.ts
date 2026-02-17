import { Injectable, NotFoundException } from '@nestjs/common';
import { CardDto, CardStatus } from './dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private repository: Repository<Card>,
  ) {}

  async create(data: CardDto) {
    console.log('Sss');
    const lastCard = await this.repository.find({
      where: { boardId: data.boardId },
      order: { position: 'DESC' },
      take: 1,
    });

    const newOrder = lastCard.length === 1 ? lastCard[0].position + 1 : 1;

    const card = this.repository.create({
      ...data,
      position: newOrder,
      status: CardStatus.ACTIVE,
    });

    return this.repository.save(card);
  }

  findAll(boardId: number) {
    return this.repository.find({
      where: {
        status: CardStatus.ACTIVE,
        boardId: boardId,
      },
    });
  }

  async findOne(id: number) {
    const card = await this.repository.findOneBy({
      id,
      status: CardStatus.ACTIVE,
    });
    if (!card) {
      throw new NotFoundException(`Cartão não encontrada`);
    }
    return card;
  }

  async update(id: number, data: CardDto) {
    const card = await this.findOne(id); // verifica se existe
    await this.repository.update(id, {
      description: data.description ?? card.description,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repository.update(id, {
      status: CardStatus.DELETED,
    });
    return true;
  }
}
