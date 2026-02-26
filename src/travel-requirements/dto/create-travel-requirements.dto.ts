import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsObject, IsOptional, IsUUID } from 'class-validator';

export class CreateTravelRequirementsDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsNotEmpty()
  @IsUUID()
  trip_id: string;

  @ApiPropertyOptional({
    example: {
      passport: true,
      visa: false,
      visa_info: 'No se requiere visado para ciudadanos de la UE',
    },
  })
  @IsOptional()
  @IsObject()
  documentation?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: { vaccines: ['Hepatitis A'], insurance_required: true },
  })
  @IsOptional()
  @IsObject()
  health_info?: Record<string, unknown>;

  @ApiPropertyOptional({
    example: { currency: 'JPY', exchange_rate: 160.5, cash_recommended: true },
  })
  @IsOptional()
  @IsObject()
  currency_info?: Record<string, unknown>;
}
