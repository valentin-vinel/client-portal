import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

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

    if (!user) throw new UnauthorizedException('Identifiants invalides');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Identifiants invalides');

    return this.signToken(user.id, user.email, user.role);
  }

  private signToken(userId: number, email: string, role: string) {
    const payload = { sub: userId, email, role };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}