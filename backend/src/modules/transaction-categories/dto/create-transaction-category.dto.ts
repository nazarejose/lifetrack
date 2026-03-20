import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { TransactionType } from '@prisma/client';

export class CreateTransactionCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsString()
  @IsOptional()
  color?: string;
}