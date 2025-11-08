import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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

  async findAll(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { 
        userId
      }
    })

    return habits
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: {
        userId,
        id
      }
    })

    if(!habit){
      throw new HttpException("Hábito não encontrado", HttpStatus.NOT_FOUND);
    }
    return habit
  }

  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string) {
    const habit = await this.findOne(id, userId)

    const patchHabit = await this.prisma.habit.update({
      where:{
        id: habit.id
      },
      data: updateHabitDto
    })

    return patchHabit

  }

  async remove(id: string, userId: string) {

   const habit = await this.findOne(id, userId)

   const deleteHabit = await this.prisma.habit.delete({
    where: {
      id: habit.id
    }
   })

   return deleteHabit
  }
}
