import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ChangePasswordDto,
  CreatePasswordDto,
  CreateUserDto,
  UpdateUserDto,
} from './user.dto';
import type { MbRequest } from '../@types/customRequest';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  @Get('verify/:token')
  verifyAccount(@Param('token') token: string) {
    return this.usersService.findOneByAccountToken(token);
  }

  @Post('verify/:token')
  savePassword(@Body() data: CreatePasswordDto) {
    return this.usersService.savePassword(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  changePassword(@Req() req: MbRequest, @Body() data: ChangePasswordDto) {
    const userId = req.user.id;
    return this.usersService.changePassword(+userId, data);
  }
}
