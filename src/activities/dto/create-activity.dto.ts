/* eslint-disable @typescript-eslint/no-unsafe-call */
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ActivityCategory } from 'src/common/enums/activity-category.enum';

export class CreateActivityDto {
  @ApiProperty({ example: 'Visita a Tokyo Tower' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID()
  trip_id: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsOptional()
  @IsUUID()
  location_id?: string;

  @ApiProperty({ example: '2026-06-01T10:00:00Z' })
  @IsNotEmpty()
  @IsDateString()
  start_time: string;

  @ApiPropertyOptional({ example: '2026-06-01T12:00:00Z' })
  @IsOptional()
  @IsDateString()
  end_time?: string;

  @ApiProperty({ example: 0 })
  @IsNumber()
  @Min(0)
  cost: number;

  @ApiProperty({ enum: ActivityCategory, example: ActivityCategory.Cultura })
  @IsNotEmpty()
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiPropertyOptional({ example: 'Comprar entradas con antelación' })
  @IsOptional()
  @IsString()
  user_notes?: string;
}
