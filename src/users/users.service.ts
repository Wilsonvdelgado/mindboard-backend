import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateUserDto, UpdateUserDto, UserStatus } from './user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(data: CreateUserDto) {
    const checkUser = await this.userRepository.findOneBy({
      email: data.email,
      status: Not(UserStatus.DELETED),
    });

    if (checkUser) {
      throw new ConflictException(`Este utilizador já existe`);
    }
    const user = this.userRepository.create(data);
    return this.userRepository.save(user);
  }

  findAll() {
    return this.userRepository.find({
      where: {
        status: Not(UserStatus.DELETED),
      },
      order: {
        name: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOneBy({
      id,
      status: Not(UserStatus.DELETED),
    });
    if (!user) {
      throw new NotFoundException(`Utilizador não encontrado`);
    }
    return user;
  }

  async update(id: number, data: UpdateUserDto) {
    const checkUser = await this.userRepository.findOneBy({
      email: data.email,
      status: Not(UserStatus.DELETED),
    });

    if (checkUser?.id !== id) {
      throw new ConflictException(`Já existe um utilizador com este email`);
    }

    const user = await this.findOne(id); // verifica se existe
    await this.userRepository.update(id, {
      name: data.name ?? user.name,
      email: data.email ?? user.email,
      role: data.role ?? user.role,
    });
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id); // verifica se existe
    await this.userRepository.update(id, {
      status: UserStatus.DELETED,
    });
    return true;
  }
}
