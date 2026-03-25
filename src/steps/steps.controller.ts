import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Steps')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des étapes d\'un projet' })
  @ApiResponse({ status: 200, description: 'Liste paginée des étapes' })
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.stepsService.findByProject(projectId, pagination);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Créer une étape (admin)' })
  @ApiResponse({ status: 201, description: 'Étape créée' })
  create(@Body() dto: CreateStepDto) {
    return this.stepsService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier une étape (admin)' })
  @ApiResponse({ status: 200, description: 'Étape modifiée' })
  @ApiResponse({ status: 404, description: 'Étape introuvable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateStepDto) {
    return this.stepsService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer une étape (admin)' })
  @ApiResponse({ status: 200, description: 'Étape supprimée' })
  @ApiResponse({ status: 404, description: 'Étape introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stepsService.remove(id);
  }
}