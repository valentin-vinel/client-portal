import { IsString, IsOptional } from 'class-validator';

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  client?: string;

  @IsString()
  @IsOptional()
  status?: string;
}