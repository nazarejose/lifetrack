import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { UpdateTransactionDto } from './dto/update-transaction.dto';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class TransactionsService {

  constructor(private prisma: PrismaService){}

  async create(createTransactionDto: CreateTransactionDto, userId: string) {
    const transaction = await this.prisma.transaction.create({
      data: {
        description: createTransactionDto.description,
        amount: createTransactionDto.amount,
        transactionType: createTransactionDto.transactionType,
        date: new Date(createTransactionDto.date),
        userId: userId,
      },
    });
  
    return transaction;
  }

  async findAll(userId: string) {
    return this.prisma.transaction.findMany({
      where:{
        userId,
      },
      orderBy:{
        date: 'desc',
      }
    })
  }

  async findOne(id: string, userId: string) {
    
    const transaction = await this.prisma.transaction.findFirst({
      where: { id, userId },
    })

    if(!transaction){
      throw new NotFoundException("Transação não encontrada ou acesso negado.")
    }
    return transaction
  }

  async update(id: string, updateTransactionDto: UpdateTransactionDto, userId: string) {
    
    this.findOne(id, userId)

    return this.prisma.transaction.update({
      where:{ id },
      data: {
        ...updateTransactionDto,
        date: updateTransactionDto.date ? new Date(updateTransactionDto.date) : undefined
      }
    })
  }

  async remove(id: string, userId: string ) {
    this.findOne(id, userId)

    return this.prisma.transaction.delete({
      where: { id }
    })
  }

  async getSummary(userId: string) {
    const stats = await this.prisma.transaction.groupBy({
      by: ['transactionType'],
      where: { userId },
      _sum: {
        amount: true,
      },
    });
  
    let totalIncome = 0;
    let totalExpense = 0;
  
    stats.forEach((item) => {
      if (item.transactionType === 'INCOME') {
        totalIncome = item._sum.amount || 0;
      } else if (item.transactionType === 'EXPENSE') {
        totalExpense = item._sum.amount || 0;
      }
    });
  
    return {
      totalIncome,
      totalExpense,
      balance: totalIncome - totalExpense,
    };
  }
}

