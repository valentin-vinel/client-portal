import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateUserDto } from './dto/create-user.dto';

@ApiTags('Users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles('admin')
  @Get()
  @ApiOperation({ summary: 'Liste de tous les utilisateurs (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs' })
  findAll() {
    return this.usersService.findAll();
  }

  @Roles('admin')
  @Get('clients')
  @ApiOperation({ summary: 'Liste des clients uniquement (admin)' })
  @ApiResponse({ status: 200, description: 'Liste des clients' })
  findClients() {
    return this.usersService.findClients();
  }

  @Roles('admin')
  @Post()
  @ApiOperation({ summary: 'Créer un compte client et envoyer l\'invitation (admin)' })
  @ApiResponse({ status: 201, description: 'Client créé et email d\'invitation envoyé' })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }
}