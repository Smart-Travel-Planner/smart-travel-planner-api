import { Controller, Get, Put, Delete, Body, Param, Req } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../common/decorators/roles.decorator';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
    role: string;
  };
}

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Obtén todos los usuarios (solo admin)' })
  @ApiResponse({ status: 200, description: 'Lista de usuarios' })
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @ApiOperation({ summary: 'Obtén tu perfil' })
  async getMe(@Req() req: RequestWithUser) {
    return this.usersService.findOne(req.user.userId);
  }

  @Get(':id/public')
  @ApiOperation({
    summary: 'Obtén nombre de un usuario por id (usuarios autenticados)',
  })
  @ApiResponse({ status: 200, description: 'Perfil público del usuario' })
  async findPublicProfile(@Param('id') id: string) {
    return this.usersService.findPublicProfile(id);
  }

  @Get(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Obtén usuario por id (solo admin)' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Put('me')
  @ApiOperation({ summary: 'Actualiza tu perfil' })
  async updateMe(
    @Req() req: RequestWithUser,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req.user.userId, updateUserDto);
  }

  @Put(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Actualiza usuario por id (solo admin)' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Borra usuario (solo admin)' })
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
