import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Put,
  Req,
} from '@nestjs/common';
import { BoardsService } from './boards.service';
import { CreateBoardDto, UpdateBoardDto } from './dto/board.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';
import type { MbRequest } from '../@types/customRequest';
import { SocketTicketService } from './socketTicket.service';

@Controller('boards')
@UseGuards(JwtAuthGuard)
export class BoardsController {
  constructor(
    private readonly boardsService: BoardsService,
    private readonly socketTickets: SocketTicketService,
  ) {}

  @Post()
  create(@Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create({ ...createBoardDto, userId: 1 });
  }

  @Get()
  findAll() {
    return this.boardsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.boardsService.findOne(+id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBoardDto: UpdateBoardDto) {
    return this.boardsService.update(+id, updateBoardDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.boardsService.remove(+id);
  }

  // socket-ticket

  @Post('socket-ticket')
  createSocketTicket(@Req() request: MbRequest) {
    const user = request.user;
   
    const ticket = this.socketTickets.create(user.id, user.exp * 1000);

    return {
      ticket,
    };
  }
}
