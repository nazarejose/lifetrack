import { Injectable } from '@nestjs/common';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { PrismaService } from 'src/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  async create(createHabitDto: CreateHabitDto, userId: string) {
    const data: Prisma.HabitCreateInput = {
      name: createHabitDto.name,
      description: createHabitDto.description,
      frequency: createHabitDto.frequency,

      user: {
        connect: {
          id: userId,
        },
      },
    };

    try {
      const newHabit = await this.prisma.habit.create({ data });
      return newHabit;
    } catch (error) {
      throw new Error('Não foi possível criar o hábito.');
    }
  }

  findAll() {
    return `This action returns all habits`;
  }

  findOne(id: number) {
    return `This action returns a #${id} habit`;
  }

  update(id: number, updateHabitDto: UpdateHabitDto) {
    return `This action updates a #${id} habit`;
  }

  remove(id: number) {
    return `This action removes a #${id} habit`;
  }
}
