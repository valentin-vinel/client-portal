import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  document: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('DocumentsService', () => {
  let service: DocumentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findByProject', () => {
    it('retourne les documents paginés d\'un projet', async () => {
      const documents = [{ id: 1, name: 'Cahier des charges', projectId: 1 }];
      mockPrismaService.document.findMany.mockResolvedValue(documents);
      mockPrismaService.document.count.mockResolvedValue(1);

      const result = await service.findByProject(1, { page: 1, limit: 10 });

      expect(result.data).toEqual(documents);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('retourne un document par son id', async () => {
      const document = { id: 1, name: 'Cahier des charges' };
      mockPrismaService.document.findUnique.mockResolvedValue(document);

      const result = await service.findOne(1);
      expect(result).toEqual(document);
    });

    it('lève une NotFoundException si le document n\'existe pas', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crée un document', async () => {
      const dto = { name: 'Cahier des charges', url: 'https://example.com/doc.pdf', type: 'pdf', projectId: 1 };
      const document = { id: 1, ...dto };
      mockPrismaService.document.create.mockResolvedValue(document);

      const result = await service.create(dto);
      expect(result).toEqual(document);
    });
  });

  describe('update', () => {
    it('met à jour un document existant', async () => {
      const document = { id: 1, name: 'Cahier des charges' };
      mockPrismaService.document.findUnique.mockResolvedValue(document);
      mockPrismaService.document.update.mockResolvedValue({ ...document, name: 'Cahier des charges V2' });

      const result = await service.update(1, { name: 'Cahier des charges V2' });
      expect(result.name).toBe('Cahier des charges V2');
    });

    it('lève une NotFoundException si le document n\'existe pas', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: 'Test' })).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('supprime un document existant', async () => {
      const document = { id: 1, name: 'Cahier des charges' };
      mockPrismaService.document.findUnique.mockResolvedValue(document);
      mockPrismaService.document.delete.mockResolvedValue(document);

      const result = await service.remove(1);
      expect(result).toEqual(document);
    });

    it('lève une NotFoundException si le document n\'existe pas', async () => {
      mockPrismaService.document.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});