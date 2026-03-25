import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des comptes rendus d\'un projet' })
  @ApiResponse({ status: 200, description: 'Liste paginée des comptes rendus' })
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.reportsService.findByProject(projectId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un compte rendu' })
  @ApiResponse({ status: 200, description: 'Compte rendu trouvé' })
  @ApiResponse({ status: 404, description: 'Compte rendu introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.findOne(id);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Créer un compte rendu (admin)' })
  @ApiResponse({ status: 201, description: 'Compte rendu créé' })
  create(@Body() dto: CreateReportDto) {
    return this.reportsService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un compte rendu (admin)' })
  @ApiResponse({ status: 200, description: 'Compte rendu modifié' })
  @ApiResponse({ status: 404, description: 'Compte rendu introuvable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReportDto) {
    return this.reportsService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un compte rendu (admin)' })
  @ApiResponse({ status: 200, description: 'Compte rendu supprimé' })
  @ApiResponse({ status: 404, description: 'Compte rendu introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reportsService.remove(id);
  }
}