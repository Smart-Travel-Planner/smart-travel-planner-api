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
import { LocationsService } from './locations.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Locations')
@ApiBearerAuth()
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crea una nueva ubicación' })
  @ApiResponse({
    status: 201,
    description: 'Ubicación creada correctamente',
  })
  async create(
    @Body() createLocationDto: CreateLocationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.locationsService.create(createLocationDto, req.user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Obtén todas las ubicaciones' })
  async findAll() {
    return this.locationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtén una ubicación por el id' })
  async findOne(@Param('id') id: string) {
    return this.locationsService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza una ubicación' })
  async update(
    @Param('id') id: string,
    @Body() updateLocationDto: UpdateLocationDto,
    @Req() req: RequestWithUser,
  ) {
    return this.locationsService.update(id, updateLocationDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borra una ubicación' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.locationsService.remove(id, req.user.userId);
  }
}
