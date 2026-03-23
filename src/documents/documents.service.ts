import { Injectable, NotFoundException } from '@nestjs/common';
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

  async findOne(id: number) {
    const document = await this.prismaService.document.findUnique({ where: { id } });
    if (!document) throw new NotFoundException(`Document ${id} introuvable`);
    return document;
  }

  create(dto: CreateDocumentDto) {
    return this.prismaService.document.create({ data: dto });
  }

  async update(id: number, dto: UpdateDocumentDto) {
    await this.findOne(id);
    return this.prismaService.document.update({ where: { id }, data: dto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prismaService.document.delete({ where: { id } });
  }
}