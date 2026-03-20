import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

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

  @IsInt()
  @IsNotEmpty()
  userId: number;
}