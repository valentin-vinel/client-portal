import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  client: string;

  @IsString()
  @IsOptional()
  status?: string;
}