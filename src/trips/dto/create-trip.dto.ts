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

  @ApiProperty({ example: '2026-06-01T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @ApiPropertyOptional({ example: '2026-06-15T10:00:00Z' })
  @IsOptional()
  @IsDateString()
  end_date?: string;

  @ApiProperty({ example: 3000 })
  @IsNumber()
  @Min(0)
  total_budget: number;

  @ApiProperty({ example: false, default: false })
  @IsNotEmpty()
  @IsBoolean()
  is_public: boolean;
}
