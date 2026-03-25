import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Documents')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('projects/:projectId/documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste des documents d\'un projet' })
  @ApiResponse({ status: 200, description: 'Liste paginée des documents' })
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() pagination: PaginationDto,
  ) {
    return this.documentsService.findByProject(projectId, pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Détail d\'un document' })
  @ApiResponse({ status: 200, description: 'Document trouvé' })
  @ApiResponse({ status: 404, description: 'Document introuvable' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.findOne(id);
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Ajouter un document (admin)' })
  @ApiResponse({ status: 201, description: 'Document ajouté' })
  create(@Body() dto: CreateDocumentDto) {
    return this.documentsService.create(dto);
  }

  @Roles('admin')
  @Patch(':id')
  @ApiOperation({ summary: 'Modifier un document (admin)' })
  @ApiResponse({ status: 200, description: 'Document modifié' })
  @ApiResponse({ status: 404, description: 'Document introuvable' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateDocumentDto) {
    return this.documentsService.update(id, dto);
  }

  @Roles('admin')
  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un document (admin)' })
  @ApiResponse({ status: 200, description: 'Document supprimé' })
  @ApiResponse({ status: 404, description: 'Document introuvable' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.documentsService.remove(id);
  }
}