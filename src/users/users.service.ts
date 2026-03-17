import {
  Injectable,
  Inject,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import * as bcrypt from 'bcrypt';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
}

@Injectable()
export class UsersService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async findAll(): Promise<UserResponseDto[]> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, name, email, role, created_at');

    if (error) {
      throw new NotFoundException(error.message);
    }

    return (data as UserRecord[]).map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    }));
  }

  async findOne(id: string): Promise<UserResponseDto> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, name, email, role, created_at')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    const user = data as UserRecord;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const updateData: Partial<UserRecord & { encrypted_password: string }> = {};

    if (updateUserDto.name) updateData.name = updateUserDto.name;
    if (updateUserDto.email) updateData.email = updateUserDto.email;
    if (updateUserDto.password) {
      updateData.encrypted_password = await bcrypt.hash(
        updateUserDto.password,
        10,
      );
    }

    const { data, error } = await this.supabase
      .from('profiles')
      .update(updateData)
      .eq('id', id)
      .select('id, name, email, role, created_at')
      .single();

    if (error || !data) {
      throw new ConflictException(
        error?.message ?? 'Error actualizando usuario',
      );
    }

    const user = data as UserRecord;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      created_at: user.created_at,
    };
  }

  async remove(id: string): Promise<{ message: string }> {
    const { error } = await this.supabase
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: 'Usuario borrado correctamente' };
  }

  async findPublicProfile(id: string): Promise<{ id: string; name: string }> {
    const { data, error } = await this.supabase
      .from('profiles')
      .select('id, name')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Usuario con id ${id} no encontrado`);
    }

    return { id: (data as UserRecord).id, name: (data as UserRecord).name };
  }
}
