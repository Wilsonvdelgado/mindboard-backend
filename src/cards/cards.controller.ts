import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { CardsService } from './cards.service';
import { CardDto } from './dto/card.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { MbRequest } from '../@types/customRequest';

@Controller('cards')
@UseGuards(JwtAuthGuard)
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  // @Post()
  // create(@Body() createCardDto: CardDto, @Req() req: MbRequest) {
  //   const userId = +req.user.id;
  //   return this.cardsService.create({ ...createCardDto, userId });
  // }

  // @Get()
  // findAll(@Query('boardId') boardId: string) {
  //   return this.cardsService.findAll(+boardId);
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.cardsService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateCardDto: CardDto) {
  //   return this.cardsService.update(+id, updateCardDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cardsService.remove(+id);
  // }
}
