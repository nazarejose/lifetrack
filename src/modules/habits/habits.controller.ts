import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { HabitsService } from './habits.service';
import { CreateHabitDto } from './dto/create-habit.dto';
import { UpdateHabitDto } from './dto/update-habit.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Body() createHabitDto: CreateHabitDto, @Req() req: any) {
    const userId = req.user.id;
    return this.habitsService.create(createHabitDto, userId);
  }

  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.id;
    return this.habitsService.findAll(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: any,) {
    const userId = req.user.id;
    return this.habitsService.findOne(id, userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHabitDto: UpdateHabitDto, @Req() req: any) {
    const userId = req.user.id;
    return this.habitsService.update(id, updateHabitDto, userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: any, ) {
    const userId = req.user.id;
    return this.habitsService.remove(id, userId);
  }
}
