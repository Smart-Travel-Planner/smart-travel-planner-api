import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ActivityCategory } from '../../common/enums/activity-category.enum';

export class CreateLocationDto {
  @ApiProperty({ example: 'Tokyo Tower' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: '4 Chome-2-8 Shibakoen, Minato City' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ enum: ActivityCategory, example: ActivityCategory.Cultura })
  @IsNotEmpty()
  @IsEnum(ActivityCategory)
  category: ActivityCategory;

  @ApiProperty({ example: 35.6586 })
  @IsNotEmpty()
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 139.7454 })
  @IsNotEmpty()
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiPropertyOptional({ example: 4.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ example: 'ChIJ3S-JXmauEmsRUcIaWtf4MzE' })
  @IsOptional()
  @IsString()
  place_id?: string;
}
