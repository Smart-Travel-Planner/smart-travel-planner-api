import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { TravelRequirementsService } from './travel-requirements.service';
import { CreateTravelRequirementsDto } from './dto/create-travel-requirements.dto';
import { UpdateTravelRequirementsDto } from './dto/update-travel-requirements.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Travel Requirements')
@ApiBearerAuth()
@Controller('travel-requirements')
export class TravelRequirementsController {
  constructor(
    private readonly travelRequirementsService: TravelRequirementsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crear requisitos de viaje para un viaje' })
  @ApiResponse({
    status: 201,
    description: 'Requisitos de viaje creados con éxito',
  })
  @ApiResponse({
    status: 409,
    description: 'Los requisitos de viaje ya existen para este viaje',
  })
  async create(
    @Body() createDto: CreateTravelRequirementsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.travelRequirementsService.create(createDto, req.user.userId);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Obtén los requisitos de viaje para un viaje' })
  async findByTrip(
    @Param('tripId') tripId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.travelRequirementsService.findByTrip(tripId, req.user.userId);
  }

  @Put('trip/:tripId')
  @ApiOperation({ summary: 'Actualizar los requisitos de viaje para un viaje' })
  async update(
    @Param('tripId') tripId: string,
    @Body() updateDto: UpdateTravelRequirementsDto,
    @Req() req: RequestWithUser,
  ) {
    return this.travelRequirementsService.update(
      tripId,
      updateDto,
      req.user.userId,
    );
  }

  @Delete('trip/:tripId')
  @ApiOperation({ summary: 'Borrar requisitos de viaje para un viaje' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('tripId') tripId: string, @Req() req: RequestWithUser) {
    return this.travelRequirementsService.remove(tripId, req.user.userId);
  }
}
