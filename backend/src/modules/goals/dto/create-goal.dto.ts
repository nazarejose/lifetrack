import { IsString, IsNotEmpty, IsOptional, IsDateString, IsEnum, Min, IsInt } from 'class-validator';
import { GoalStatus } from '@prisma/client';

export class CreateGoalDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  targetValue: number;
  
  @IsInt()
  @IsOptional()
  @Min(0)
  currentValue?: number;

  @IsDateString()
  deadline: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsEnum(GoalStatus)
  @IsOptional()
  status?: GoalStatus;

  @IsString()
  @IsOptional()
  habitId?: string;
}