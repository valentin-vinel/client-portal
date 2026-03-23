import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProjectsModule } from './projects/projects.module';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { StepsModule } from './steps/steps.module';
import { ReportsModule } from './reports/reports.module';
import { DocumentsModule } from './documents/documents.module';

@Module({
  imports: [ProjectsModule, AuthModule, StepsModule, ReportsModule, DocumentsModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
