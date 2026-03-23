import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prismaService: PrismaService) {}

  findByProject(projectId: number) {
    return this.prismaService.document.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: number) {
    return this.prismaService.document.findUnique({
      where: { id },
    });
  }

  create(dto: CreateDocumentDto) {
    return this.prismaService.document.create({
      data: dto,
    });
  }

  update(id: number, dto: UpdateDocumentDto) {
    return this.prismaService.document.update({
      where: { id },
      data: dto,
    });
  }

  remove(id: number) {
    return this.prismaService.document.delete({
      where: { id },
    });
  }
}