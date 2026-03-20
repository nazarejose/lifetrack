import { Module } from '@nestjs/common';
import { TransactionCategoriesService } from './transaction-categories.service';
import { TransactionCategoriesController } from './transaction-categories.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [TransactionCategoriesController],
  providers: [TransactionCategoriesService, PrismaService],
  exports: [TransactionCategoriesService],
})
export class TransactionCategoriesModule {}