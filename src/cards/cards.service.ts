import { Injectable, NotFoundException } from '@nestjs/common';
import { BoardCardDto, CardDto, CardStatus } from './dto/card.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Card } from './entities/card.entity';

@Injectable()
export class CardsService {
  constructor(
    @InjectRepository(Card)
    private repository: Repository<Card>,
    private readonly dataSource: DataSource,
  ) {}

  async create(data: CardDto) {
    return await this.dataSource.transaction(async (manager) => {
      const lastCard = await manager
        .getRepository(Card)
        .createQueryBuilder('card')
        .where('card.boardId = :boardId', { boardId: data.boardId })
        .setLock('pessimistic_write') // evita duplicidade
        .orderBy('card.position', 'DESC')
        .getOne();

      const newPosition = lastCard ? lastCard.position + 1 : 1;

      const card = manager.getRepository(Card).create({
        ...data,
        color: data.color ?? undefined,
        position: newPosition,
        status: CardStatus.ACTIVE,
      });

      return manager.getRepository(Card).save(card);
    });
  }

  async findAll(boardId: number) {
    const dataList = await this.repository.find({
      where: {
        status: CardStatus.ACTIVE,
        boardId: boardId,
      },
      order: {
        position: 'ASC',
      },
      relations: { user: true },
      select: {
        id: true,
        description: true,
        position: true,
        color: true,
        user: {
          name: true,
        },
      },
    });

    const list: BoardCardDto[] = dataList.map((item) => ({
      id: item.id,
      boardId: item.boardId,
      description: item.description,
      position: item.position,
      userName: item.user.name,
      color: item.color,
    }));

    return list;
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

  async updatePosition(cardId: number, newPosition: number): Promise<Card> {
    const card = await this.repository.findOne({ where: { id: cardId } });
    if (!card) throw new NotFoundException('Card not found');

    const oldPosition = card.position;
    const boardId = card.boardId;

    if (newPosition === card.position) return card;

    // Cria query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Bulk update dos outros cards
      if (newPosition > oldPosition) {
        console.log('newPosition >old position');
        // move os cards intermediários para trás
        await queryRunner.manager
          .createQueryBuilder()
          .update(Card)
          .set({ position: () => 'position - 1' })
          .where('boardId = :boardId', { boardId })
          .andWhere('position > :oldPos AND position <= :newPos', {
            oldPos: oldPosition,
            newPos: newPosition,
          })
          .execute();
      } else {
        console.log('newPosition <old position');
        // move os cards intermediários para frente
        await queryRunner.manager
          .createQueryBuilder()
          .update(Card)
          .set({ position: () => 'position + 1' })
          .where('boardId = :boardId', { boardId })
          .andWhere('position >= :newPos AND position < :oldPos', {
            newPos: newPosition,
            oldPos: oldPosition,
          })
          .execute();
      }

      //Atualiza o card movido
      const updateResult = await queryRunner.manager
        .createQueryBuilder()
        .update(Card)
        .set({ position: newPosition })
        .where('id = :cardId', { cardId })
        .execute();

      if (updateResult.affected === 0) {
        throw new NotFoundException('Card not found');
      }

      // Commit da transação
      await queryRunner.commitTransaction();
    } catch (err) {
      // Rollback se falhar
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
    return { ...card, position: newPosition };
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.repository.update(id, {
      status: CardStatus.DELETED,
    });
    return true;
  }
}
