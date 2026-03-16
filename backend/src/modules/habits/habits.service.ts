import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
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
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const habits = await this.prisma.habit.findMany({
    where: { userId },
    include: {
      _count: {
        select: { logs: true },
      },
      logs: {
        where: {
          date: {
            gte: today,
            lt: tomorrow,
          },
        },
        take: 1,
      },
    },
  });

  return habits.map((habit) => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    frequency: habit.frequency,
    totalCompletions: habit._count.logs,
    isCheckedToday: habit.logs.length > 0,
  }));
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
    
    await this.findOne(id, userId);
  
    return this.prisma.habit.update({
      where: { id },
      data: updateHabitDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    
    return this.prisma.habit.delete({
      where: { id },
    });
  }

  async toggleCheckIn(habitId: string, userId: string) {

    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId }
    });
  
    if (!habit) throw new NotFoundException('Hábito não encontrado');
  
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
  
    const existingLog = await this.prisma.habitLog.findFirst({
      where: {
        habitId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });
  
    if (existingLog) {
      await this.prisma.habitLog.delete({ where: { id: existingLog.id } });
      return { checked: false };
    } else {
      await this.prisma.habitLog.create({
        data: { habitId, date: new Date() }
      });
      return { checked: true };
    }
  }
}
