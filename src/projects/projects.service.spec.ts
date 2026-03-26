import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { PrismaService } from '../prisma.service';
import { NotFoundException } from '@nestjs/common';

const mockPrismaService = {
  project: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('retourne tous les projets pour un admin', async () => {
      const projects = [{ id: 1, name: 'Test' }];
      mockPrismaService.project.findMany.mockResolvedValue(projects);
      mockPrismaService.project.count.mockResolvedValue(1);

      const result = await service.findAll(1, 'admin', { page: 1, limit: 10 });

      expect(result.data).toEqual(projects);
      expect(result.meta.total).toBe(1);
      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: {} }),
      );
    });

    it('filtre les projets par userId pour un client', async () => {
      mockPrismaService.project.findMany.mockResolvedValue([]);
      mockPrismaService.project.count.mockResolvedValue(0);

      await service.findAll(1, 'client', { page: 1, limit: 10 });

      expect(mockPrismaService.project.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: 1 } }),
      );
    });
  });

  describe('findOne', () => {
    it('retourne un projet par son id', async () => {
      const project = { id: 1, name: 'Test' };
      mockPrismaService.project.findUnique.mockResolvedValue(project);

      const result = await service.findOne(1);
      expect(result).toEqual(project);
    });

    it('lève une NotFoundException si le projet n\'existe pas', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('crée un projet', async () => {
      const dto = { name: 'Nouveau', client: 'Client', userId: 1 };
      const project = { id: 1, ...dto };
      mockPrismaService.project.create.mockResolvedValue(project);

      const result = await service.create(dto);
      expect(result).toEqual(project);
    });
  });

  describe('remove', () => {
    it('supprime un projet existant', async () => {
      const project = { id: 1, name: 'Test' };
      mockPrismaService.project.findUnique.mockResolvedValue(project);
      mockPrismaService.project.delete.mockResolvedValue(project);

      const result = await service.remove(1);
      expect(result).toEqual(project);
    });

    it('lève une NotFoundException si le projet n\'existe pas', async () => {
      mockPrismaService.project.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});