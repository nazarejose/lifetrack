import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateTransactionCategoryDto } from './dto/create-transaction-category.dto';

@Injectable()
export class TransactionCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTransactionCategoryDto, userId: string) {
    return this.prisma.transactionCategory.create({
      data: {
        name: dto.name,
        type: dto.type,
        color: dto.color ?? '#3b82f6',
        userId,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.transactionCategory.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async remove(id: string, userId: string) {
    const category = await this.prisma.transactionCategory.findFirst({
      where: { id, userId },
    });

    if (!category) {
      throw new NotFoundException('Categoria não encontrada.');
    }

    return this.prisma.transactionCategory.delete({ where: { id } });
  }
}