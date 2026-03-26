import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockPrismaService = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock_token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('crée un compte et retourne un token', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        role: 'client',
      });

      const result = await service.register({
        email: 'test@test.com',
        password: 'motdepasse123',
      });

      expect(result).toEqual({ access_token: 'mock_token' });
    });

    it('lève une ConflictException si l\'email existe déjà', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({ id: 1 });

      await expect(
        service.register({ email: 'test@test.com', password: 'motdepasse123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('retourne un token si les identifiants sont valides', async () => {
      const hash = await bcrypt.hash('motdepasse123', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        role: 'client',
        password: hash,
      });

      const result = await service.login({
        email: 'test@test.com',
        password: 'motdepasse123',
      });

      expect(result).toEqual({ access_token: 'mock_token' });
    });

    it('lève une UnauthorizedException si l\'email n\'existe pas', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({ email: 'inconnu@test.com', password: 'motdepasse123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('lève une UnauthorizedException si le mot de passe est incorrect', async () => {
      const hash = await bcrypt.hash('autremotdepasse', 10);
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: 1,
        email: 'test@test.com',
        role: 'client',
        password: hash,
      });

      await expect(
        service.login({ email: 'test@test.com', password: 'mauvais' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});