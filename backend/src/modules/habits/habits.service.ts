import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { PrismaService } from 'src/prisma.service';
import { Frequency, Prisma } from '@prisma/client';

@Injectable()
export class HabitsService {
  constructor(private prisma: PrismaService) {}

  private getDateRange(frequency: Frequency): { start: Date; end: Date } {
    const now = new Date();

    if (frequency === 'DAILY') {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }

    if (frequency === 'WEEKLY') {
      const start = new Date(now);
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }

    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return { start, end };
  }

  async create(createHabitDto: CreateHabitDto, userId: string) {
    const data: Prisma.HabitCreateInput = {
      name: createHabitDto.name,
      description: createHabitDto.description,
      frequency: createHabitDto.frequency,
      user: { connect: { id: userId } },
    };

    try {
      return await this.prisma.habit.create({ data });
    } catch {
      throw new Error('Não foi possível criar o hábito.');
    }
  }

  async findAll(userId: string) {
    const habits = await this.prisma.habit.findMany({
      where: { userId },
      include: {
        _count: { select: { logs: true } },
        logs: true,
      },
    });

    return habits.map((habit) => {
      const { start, end } = this.getDateRange(habit.frequency);

      const isCheckedToday = habit.logs.some(
        (log) => log.date >= start && log.date < end
      );

      const streak = this.calculateStreak(habit.logs.map(l => l.date), habit.frequency);

      return {
        id: habit.id,
        name: habit.name,
        description: habit.description,
        frequency: habit.frequency,
        totalCompletions: habit._count.logs,
        isCheckedToday,
        streak,
      };
    });
  }

  private calculateStreak(dates: Date[], frequency: Frequency): number {
    if (dates.length === 0) return 0;

    const sorted = [...dates].sort((a, b) => b.getTime() - a.getTime());

    const getPeriodKey = (date: Date): string => {
      if (frequency === 'DAILY') {
        return date.toISOString().split('T')[0];
      }
      if (frequency === 'WEEKLY') {
        const d = new Date(date);
        d.setDate(d.getDate() - d.getDay());
        return d.toISOString().split('T')[0];
      }
      
      return `${date.getFullYear()}-${date.getMonth()}`;
    };

    const uniquePeriods = [...new Set(sorted.map(getPeriodKey))];

    let streak = 0;
    const now = new Date();

    for (let i = 0; i < uniquePeriods.length; i++) {
      const expected = new Date(now);

      if (frequency === 'DAILY') {
        expected.setDate(expected.getDate() - i);
        const key = expected.toISOString().split('T')[0];
        if (uniquePeriods[i] === key) streak++;
        else break;
      }

      if (frequency === 'WEEKLY') {
        expected.setDate(expected.getDate() - expected.getDay() - i * 7);
        const key = expected.toISOString().split('T')[0];
        if (uniquePeriods[i] === key) streak++;
        else break;
      }

      if (frequency === 'MONTHLY') {
        expected.setMonth(expected.getMonth() - i);
        const key = `${expected.getFullYear()}-${expected.getMonth()}`;
        if (uniquePeriods[i] === key) streak++;
        else break;
      }
    }

    return streak;
  }

  async toggleCheckIn(habitId: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id: habitId, userId },
    });
  
    if (!habit) throw new NotFoundException('Hábito não encontrado');
  
    const { start, end } = this.getDateRange(habit.frequency);
  
    const existingLog = await this.prisma.habitLog.findFirst({
      where: {
        habitId,
        date: { gte: start, lt: end },
      },
    });
  
    if (existingLog) {
      
      await this.prisma.habitLog.delete({ where: { id: existingLog.id } });

      await this.prisma.goal.updateMany({
        where: { habitId, userId },
        data: { currentValue: { decrement: 1 } },
      });
  
      return { checked: false };
    } else {

      await this.prisma.habitLog.create({
        data: { habitId, date: new Date() },
      });
  
      await this.prisma.goal.updateMany({
        where: { habitId, userId },
        data: { currentValue: { increment: 1 } },
      });
  
      return { checked: true };
    }
  }

  async findOne(id: string, userId: string) {
    const habit = await this.prisma.habit.findFirst({ where: { id, userId } });
    if (!habit) throw new HttpException('Hábito não encontrado', HttpStatus.NOT_FOUND);
    return habit;
  }

  async update(id: string, updateHabitDto: UpdateHabitDto, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.habit.update({ where: { id }, data: updateHabitDto });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    return this.prisma.habit.delete({ where: { id } });
  }
}