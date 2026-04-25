import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { SetPasswordDto } from './dto/set-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Email déjà utilisé');

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prismaService.user.create({
      data: { email: dto.email, password: hash },
    });

    return this.signToken(user.id, user.email, user.role);
  }

  async login(dto: LoginDto) {
    const user = await this.prismaService.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.password) throw new UnauthorizedException('Identifiants invalides');

    if (!user.isActive) throw new UnauthorizedException('Compte non activé');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: userId, email, role },
    };
  }

  async setPassword(dto: SetPasswordDto) {
    const user = await this.prismaService.user.findUnique({
      where: { invitationToken: dto.token },
    });

    if (!user) throw new UnauthorizedException('Token invalide');

    if (!user.invitationTokenExpiry || user.invitationTokenExpiry < new Date()) {
      throw new UnauthorizedException('Token expiré');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    await this.prismaService.user.update({
      where: { id: user.id },
      data: {
        password: hash,
        isActive: true,
        invitationToken: null,
        invitationTokenExpiry: null,
      },
    });

    return this.signToken(user.id, user.email, user.role);
  }
}