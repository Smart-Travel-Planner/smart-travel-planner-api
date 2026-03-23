import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { AiService } from './ai.service';

class GenerateRequirementsDto {
  @IsNotEmpty()
  @IsString()
  destination: string;
}

@ApiBearerAuth()
@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('generate-requirements')
  @ApiOperation({
    summary: 'Genera requisitos de viaje con IA dado un destino',
  })
  generateRequirements(@Body() body: GenerateRequirementsDto) {
    return this.aiService.generateTravelRequirements(body.destination);
  }
}
