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
import { TripMembersService } from './trip-members.service';
import { AddMemberDto } from './dto/add-member.dto';
import { UpdateMemberRoleDto } from './dto/update-member-role.dto';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Trip Members')
@ApiBearerAuth()
@Controller('trips/:tripId/members')
export class TripMembersController {
  constructor(private readonly tripMembersService: TripMembersService) {}

  @Post()
  @ApiOperation({ summary: 'Añade un colaborador a un viaje' })
  @ApiResponse({ status: 201, description: 'Miembro añadido correctamente' })
  @ApiResponse({ status: 409, description: 'El usuario ya es colaborador' })
  async addMember(
    @Param('tripId') tripId: string,
    @Body() addMemberDto: AddMemberDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tripMembersService.addMember(
      tripId,
      addMemberDto,
      req.user.userId,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los miembros de un viaje' })
  async findMembers(
    @Param('tripId') tripId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.tripMembersService.findMembers(tripId, req.user.userId);
  }

  @Put(':memberId/role')
  @ApiOperation({ summary: 'Actualiza el rol de un miembro' })
  async updateMemberRole(
    @Param('tripId') tripId: string,
    @Param('memberId') memberId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Req() req: RequestWithUser,
  ) {
    return this.tripMembersService.updateMemberRole(
      tripId,
      memberId,
      updateMemberRoleDto.role,
      req.user.userId,
    );
  }

  @Delete(':memberId')
  @ApiOperation({ summary: 'Borra un miembro de un viaje' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @Param('tripId') tripId: string,
    @Param('memberId') memberId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.tripMembersService.removeMember(
      tripId,
      memberId,
      req.user.userId,
    );
  }
}
