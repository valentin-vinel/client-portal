import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateUserDto } from './dto/create-user.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    private prismaService: PrismaService,
    private mailService: MailService,
  ) {}

  findAll() {
    return this.prismaService.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        company: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  findClients() {
    return this.prismaService.user.findMany({
      where: { role: 'client' },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        company: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email déjà utilisé');

    const invitationToken = randomBytes(32).toString('hex');
    const invitationTokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const user = await this.prismaService.user.create({
      data: {
        ...dto,
        role: 'client',
        isActive: false,
        invitationToken,
        invitationTokenExpiry,
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        company: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    await this.mailService.sendInvitation(dto.email, invitationToken, dto.firstName);

    return user;
  }
}