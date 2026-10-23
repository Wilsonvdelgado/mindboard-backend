import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ChangePasswordDto,
  CreatePasswordDto,
  CreateUserDto,
  UpdateUserDto,
  UserStatus,
} from './user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Not, Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MailerService } from '@nestjs-modules/mailer';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private mailerService: MailerService,
  ) {}

  async create(data: CreateUserDto) {
    const checkUser = await this.userRepository.findOneBy({
      email: data.email,
      status: Not(UserStatus.DELETED),
    });

    if (checkUser) {
      throw new ConflictException(`Este utilizador já existe`);
    }

    const verificationToken = uuidv4();

    const user = this.userRepository.create({ ...data, verificationToken });
    const savedUser = await this.userRepository.save(user);

    const link = `${process.env.FRONTEND_URL}/verify-acount/${user.verificationToken}`;

    // 3. Enviar email
    await this.mailerService.sendMail({
      to: savedUser.email,
      subject: 'Definir palavra-passe',
      template: './verify-email', // caminho para verify-email.hbs
      context: {
        name: savedUser.name,
        link: link,
      },
    });

    return savedUser;
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

  async findOneByAccountToken(token: string) {
    const user = await this.userRepository.findOneBy({
      verificationToken: token,
      status: UserStatus.PENDING,
    });
    if (!user) {
      throw new NotFoundException(`Utilizador não encontrado`);
    }

    return {
      name: user.name,
    };
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

  async savePassword(data: CreatePasswordDto) {
    const user = await this.userRepository.findOneBy({
      verificationToken: data.token,
      status: Not(UserStatus.DELETED),
    });

    if (!user) {
      throw new ConflictException(`Erro`);
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    await this.userRepository.update(user.id, {
      verificationToken: undefined,
      password: hashedPassword,
      status: UserStatus.ACTIVE,
    });

    return true;
  }

  async changePassword(userId: number, data: ChangePasswordDto) {
    const user = await this.userRepository.findOneBy({
      id: userId,
    });

    if (!user) {
      throw new ConflictException(`Ocorreu um erro!`);
    }

    const valid = await bcrypt.compare(data.currentPassword, user.password);

    if (!valid)
      throw new UnauthorizedException('Palavra-passe atual incorreta!');

    const hashedPassword = await bcrypt.hash(data.newPassword, 10);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
    });

    return true;
  }
}
