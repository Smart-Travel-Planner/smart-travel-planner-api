import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateMemberRoleDto {
  @ApiProperty({ example: 'user' })
  @IsNotEmpty()
  @IsString()
  role: string;
}
