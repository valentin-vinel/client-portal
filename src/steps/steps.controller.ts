import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Get()
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.stepsService.findByProject(projectId, pagination);
  }

  @Roles('admin')
  @Post()
  create(@Body() dto: CreateStepDto) {
    return this.stepsService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStepDto) {
    return this.stepsService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stepsService.remove(id);
  }
}