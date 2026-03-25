// import {
//   Controller,
//   Get,
//   Post,
//   Put,
//   Delete,
//   Body,
//   Param,
//   Req,
//   HttpCode,
//   HttpStatus,
// } from '@nestjs/common';
// import {
//   ApiTags,
//   ApiOperation,
//   ApiResponse,
//   ApiBearerAuth,
// } from '@nestjs/swagger';
// import { TripsService } from './trips.service';
// import { CreateTripDto } from './dto/create-trip.dto';
// import { UpdateTripDto } from './dto/update-trip.dto';
// import { AiService } from '../ai/ai.service';

// interface RequestWithUser extends Request {
//   user: {
//     userId: string;
//     email: string;
//     role: string;
//   };
// }

// @ApiTags('Trips')
// @ApiBearerAuth()
// @Controller('trips')
// export class TripsController {
//   constructor(
//     private readonly tripsService: TripsService,
//     private readonly aiService: AiService,
//   ) {}

//   @Post()
//   @ApiOperation({ summary: 'Crea un nuevo viaje' })
//   @ApiResponse({ status: 201, description: 'Viaje creado correctamente' })
//   async create(
//     @Body() createTripDto: CreateTripDto,
//     @Req() req: RequestWithUser,
//   ) {
//     return this.tripsService.create(createTripDto, req.user.userId);
//   }

//   @Get('public')
//   @ApiOperation({ summary: 'Obtén todos los viajes públicos' })
//   async findAll() {
//     return this.tripsService.findAll();
//   }

//   @Get('my-trips')
//   @ApiOperation({ summary: 'Obtén tus viajes' })
//   async findMyTrips(@Req() req: RequestWithUser) {
//     return this.tripsService.findMyTrips(req.user.userId);
//   }

//   @Get(':id')
//   @ApiOperation({ summary: 'Obtén un viaje por el id' })
//   async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
//     return this.tripsService.findOne(id, req.user.userId);
//   }

//   @Put(':id')
//   @ApiOperation({ summary: 'Actualiza un viaje' })
//   async update(
//     @Param('id') id: string,
//     @Body() updateTripDto: UpdateTripDto,
//     @Req() req: RequestWithUser,
//   ) {
//     return this.tripsService.update(id, updateTripDto, req.user.userId);
//   }

//   @Delete(':id')
//   @ApiOperation({ summary: 'Borra un viaje' })
//   @HttpCode(HttpStatus.NO_CONTENT)
//   async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
//     return this.tripsService.remove(id, req.user.userId);
//   }

//   @Get(':id/requirements')
//   async getRequirements(@Param('id') id: string) {
//     // Aquí llamamos al método del servicio que tiene el Mock
//     return await this.aiService.generateTravelRequirements(id);
//   }
// }

import {
  BadRequestException,
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
import { TripsService } from './trips.service';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { AiService } from '../ai/ai.service';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Trips')
@ApiBearerAuth()
@Controller('trips')
export class TripsController {
  constructor(
    private readonly tripsService: TripsService,
    private readonly aiService: AiService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Crea un nuevo viaje' })
  @ApiResponse({ status: 201, description: 'Viaje creado correctamente' })
  async create(
    @Body() createTripDto: CreateTripDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tripsService.create(createTripDto, req.user.userId);
  }

  @Get('public')
  @ApiOperation({ summary: 'Obtén todos los viajes públicos' })
  async findAll() {
    return this.tripsService.findAll();
  }

  @Get('my-trips')
  @ApiOperation({ summary: 'Obtén tus viajes' })
  async findMyTrips(@Req() req: RequestWithUser) {
    return this.tripsService.findMyTrips(req.user.userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtén un viaje por el id' })
  async findOne(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tripsService.findOne(id, req.user.userId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualiza un viaje' })
  async update(
    @Param('id') id: string,
    @Body() updateTripDto: UpdateTripDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tripsService.update(id, updateTripDto, req.user.userId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Borra un viaje' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: RequestWithUser) {
    return this.tripsService.remove(id, req.user.userId);
  }

  @Get(':id/requirements')
  async getRequirements(@Param('id') id: string, @Req() req: RequestWithUser) {
    const trip = await this.tripsService.findOne(id, req.user.userId);

    if (!trip.destination) {
      throw new BadRequestException(
        'El viaje no tiene destination configurado para generar requisitos.',
      );
    }

    return this.aiService.generateTravelRequirements(trip.destination);
  }
}
