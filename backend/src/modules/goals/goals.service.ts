import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { PrismaService } from 'src/prisma.service';
import { GoalStatus } from '@prisma/client';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(createGoalDto: CreateGoalDto, userId: string) {
    return this.prisma.goal.create({
      data: {
        name: createGoalDto.name,
        description: createGoalDto.description,
        targetValue: createGoalDto.targetValue,
        currentValue: createGoalDto.currentValue ?? 0,
        deadline: new Date(createGoalDto.deadline),
        category: createGoalDto.category,
        status: createGoalDto.status ?? GoalStatus.ON_TRACK,
        userId,
        habitId: createGoalDto.habitId ?? null,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({
      where: { userId },
      orderBy: { deadline: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const goal = await this.prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!goal) {
      throw new NotFoundException('Meta não encontrada ou acesso negado.');
    }

    return goal;
  }

  async update(id: string, updateGoalDto: UpdateGoalDto, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.goal.update({
      where: { id },
      data: {
        ...updateGoalDto,
        deadline: updateGoalDto.deadline
          ? new Date(updateGoalDto.deadline)
          : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.goal.delete({
      where: { id },
    });
  }
}