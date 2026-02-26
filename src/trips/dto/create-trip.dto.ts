/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateTripDto {
  @ApiProperty({ example: 'Viaje a Japón' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsOptional()
  @IsString()
  image_url?: string;

  @ApiProperty({ example: '2026-06-01' })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ example: '2026-06-15' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  total_budget: number;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  is_public?: boolean;
}
