import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './auth.dto';
import { UserStatus } from '../users/user.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email, status: UserStatus.ACTIVE },
    });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(dto.password, user.password);

    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    const { id, email, name, role } = user;

    const token = this.jwtService.sign({
      id,
      email,
      name,
      role,
    });

    return { token, user: { name, email } };
  }

  //   async findById(id: number) {
  //     return this.userRepo.findOne({ where: { id } });
  //   }
}
