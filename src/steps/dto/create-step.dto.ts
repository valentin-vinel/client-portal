import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateStepDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsNotEmpty()
  order: number;

  @IsInt()
  @IsNotEmpty()
  projectId: number;
}