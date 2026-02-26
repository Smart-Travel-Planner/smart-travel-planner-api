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
import { ActivitiesService } from './activities.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Activities')
@ApiBearerAuth()
@Controller('activities')
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva actividad' })
  @ApiResponse({ status: 201, description: 'Actividad creada correctamente' })
  async create(
    @Body() createActivityDto: CreateActivityDto,
    @Req() req: RequestWithUser,
  ) {
    return this.activitiesService.create(createActivityDto, req.user.userId);
  }

  @Get('trip/:tripId')
  @ApiOperation({ summary: 'Obtén todas las actividades de un viaje' })
  async findByTrip(
    @Param('tripId') tripId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.activitiesService.findByTrip(tripId, req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtén una actividad por id' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activitiesService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza una actividad' })
  async update(
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
    @Req() req: RequestWithUser,
  ) {
    return this.activitiesService.update(
      id,
      updateActivityDto,
      req.user.userId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borra una actividad' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.activitiesService.remove(id, req.user.userId);
  }
}
