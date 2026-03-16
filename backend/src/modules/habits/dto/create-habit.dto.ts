import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { Frequency } from '@prisma/client';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Frequency)
  frequency: Frequency
}