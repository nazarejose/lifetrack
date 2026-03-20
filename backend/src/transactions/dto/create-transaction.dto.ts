import { IsDateString, IsEnum, IsNotEmpty, IsOptional, IsString } from "@nestjs/class-validator";
import { TransactionType } from "@prisma/client";

export class CreateTransactionDto {

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    amount: number;

    @IsEnum(TransactionType)
    transactionType: TransactionType;

    @IsDateString()
    date: string;

    @IsString()
    @IsOptional()
    categoryId?: string;
}
