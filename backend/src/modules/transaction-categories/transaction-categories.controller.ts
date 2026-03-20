import { Controller, Get, Post, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { TransactionCategoriesService } from './transaction-categories.service';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/active-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('transaction-categories')
export class TransactionCategoriesController {
  constructor(private readonly service: TransactionCategoriesService) {}

  @Post()
  create(@Body() dto: CreateTransactionCategoryDto, @Req() req: RequestWithUser) {
    return this.service.create(dto, req.user.id);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.service.findAll(req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.service.remove(id, req.user.id);
  }
}