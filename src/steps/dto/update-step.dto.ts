import { IsString, IsOptional, IsInt } from 'class-validator';

export class UpdateStepDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  status?: string;

  @IsInt()
  @IsOptional()
  order?: number;
}