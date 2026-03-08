import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private prismaService: PrismaService) {}

  findAll() {
    return this.prismaService.project.findMany();
  }
}
