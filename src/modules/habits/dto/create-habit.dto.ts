import { IsNotEmpty, IsString, IsOptional, IsIn } from 'class-validator';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['DIARY', 'WEEKLY', 'MONTHLY'])
  frequency: string;
}