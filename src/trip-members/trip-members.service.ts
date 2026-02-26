/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { AddMemberDto } from './dto/add-member.dto';
import { MemberResponseDto } from './dto/member-response.dto';

interface MemberRecord {
  id: string;
  trip_id: string;
  user_id: string;
  role: string;
  joined_at: string;
}

interface TripRecord {
  id: string;
  user_id: string;
}

@Injectable()
export class TripMembersService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  private mapMember = (member: MemberRecord): MemberResponseDto => ({
    id: member.id,
    trip_id: member.trip_id,
    user_id: member.user_id,
    role: member.role,
    joined_at: member.joined_at,
  });

  private async verifyTripOwner(tripId: string, userId: string): Promise<void> {
    const { data: rawData, error } = await this.supabase
      .from('trips')
      .select('id, user_id')
      .eq('id', tripId)
      .single();

    if (error || !rawData) {
      throw new NotFoundException(`Viaje con id ${tripId} no encontrado`);
    }

    const trip = rawData as TripRecord;

    if (trip.user_id !== userId) {
      throw new ForbiddenException(
        'Sólo el propietario del viaje puede gestionar a los miembros',
      );
    }
  }

  async addMember(
    tripId: string,
    addMemberDto: AddMemberDto,
    userId: string,
  ): Promise<MemberResponseDto> {
    await this.verifyTripOwner(tripId, userId);

    const { data: existing } = await this.supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', addMemberDto.user_id)
      .single();

    if (existing) {
      throw new ConflictException('El usuario ya es colaborador de este viaje');
    }

    const { data: rawData, error } = await this.supabase
      .from('trip_members')
      .insert({
        trip_id: tripId,
        user_id: addMemberDto.user_id,
        role: addMemberDto.role ?? 'colaborador',
      })
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error añadiendo un colaborador',
      );
    }

    return this.mapMember(rawData as MemberRecord);
  }

  async findMembers(
    tripId: string,
    userId: string,
  ): Promise<MemberResponseDto[]> {
    await this.verifyTripOwner(tripId, userId);

    const { data: rawData, error } = await this.supabase
      .from('trip_members')
      .select()
      .eq('trip_id', tripId);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return (rawData as MemberRecord[]).map(this.mapMember);
  }

  async updateMemberRole(
    tripId: string,
    memberId: string,
    role: string,
    userId: string,
  ): Promise<MemberResponseDto> {
    await this.verifyTripOwner(tripId, userId);

    const { data: rawData, error } = await this.supabase
      .from('trip_members')
      .update({ role })
      .eq('id', memberId)
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(error?.message ?? 'Miembro no encontrado');
    }

    return this.mapMember(rawData as MemberRecord);
  }

  async removeMember(
    tripId: string,
    memberId: string,
    userId: string,
  ): Promise<{ message: string }> {
    await this.verifyTripOwner(tripId, userId);

    const { error } = await this.supabase
      .from('trip_members')
      .delete()
      .eq('id', memberId)
      .eq('trip_id', tripId);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: 'Miembro borrado correctamente' };
  }
}
