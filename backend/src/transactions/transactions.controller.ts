import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { JwtAuthGuard } from 'src/modules/auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/active-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@Body() createTransactionDto: CreateTransactionDto, @Req() req: RequestWithUser) {
    return this.transactionsService.create(createTransactionDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.transactionsService.findAll(req.user.id);
  }
  
  @Get('summary')
  getSummary(@Req() req: RequestWithUser) {
  return this.transactionsService.getSummary(req.user.id);
}

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.transactionsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Body() updateTransactionDto: UpdateTransactionDto,
    @Req() req: RequestWithUser
  ) {
    return this.transactionsService.update(id, updateTransactionDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.transactionsService.remove(id, req.user.id);
  }
}
