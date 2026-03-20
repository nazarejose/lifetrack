import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import type { RequestWithUser } from 'src/common/interfaces/active-user.interface';

@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  create(@Body() createGoalDto: CreateGoalDto, @Req() req: RequestWithUser) {
    return this.goalsService.create(createGoalDto, req.user.id);
  }

  @Get()
  findAll(@Req() req: RequestWithUser) {
    return this.goalsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.goalsService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateGoalDto: UpdateGoalDto,
    @Req() req: RequestWithUser,
  ) {
    return this.goalsService.update(id, updateGoalDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.goalsService.remove(id, req.user.id);
  }
}