import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Request, Query } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des projets (filtrée par rôle)' })
  @ApiResponse({ status: 200, description: 'Liste paginée des projets' })
  findAll(@Request() req, @Query() pagination: PaginationDto) {
    return this.projectsService.findAll(req.user.id, req.user.role, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un projet avec étapes, documents et comptes rendus' })
  @ApiResponse({ status: 200, description: 'Projet trouvé' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.findOne(id);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Créer un projet (admin)' })
  @ApiResponse({ status: 201, description: 'Projet créé' })
  create(@Body() dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un projet (admin)' })
  @ApiResponse({ status: 200, description: 'Projet modifié' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateProjectDto) {
    return this.projectsService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un projet (admin)' })
  @ApiResponse({ status: 200, description: 'Projet supprimé' })
  @ApiResponse({ status: 404, description: 'Projet introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.projectsService.remove(id);
  }
}