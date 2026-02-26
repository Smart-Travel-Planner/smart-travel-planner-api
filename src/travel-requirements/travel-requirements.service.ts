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
import { CreateTravelRequirementsDto } from './dto/create-travel-requirements.dto';
import { UpdateTravelRequirementsDto } from './dto/update-travel-requirements.dto';
import { TravelRequirementsResponseDto } from './dto/travel-requirements-response.dto';

interface TravelRequirementsRecord {
  id: string;
  trip_id: string;
  documentation?: Record<string, unknown>;
  health_info?: Record<string, unknown>;
  currency_info?: Record<string, unknown>;
  last_updated?: string;
}

interface TripRecord {
  id: string;
  user_id: string;
}

@Injectable()
export class TravelRequirementsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  private mapRecord = (
    record: TravelRequirementsRecord,
  ): TravelRequirementsResponseDto => ({
    id: record.id,
    trip_id: record.trip_id,
    documentation: record.documentation,
    health_info: record.health_info,
    currency_info: record.currency_info,
    last_updated: record.last_updated,
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
        'No tienes permiso para administrar los requisitos de este viaje',
      );
    }
  }

  async create(
    createDto: CreateTravelRequirementsDto,
    userId: string,
  ): Promise<TravelRequirementsResponseDto> {
    await this.verifyTripOwner(createDto.trip_id, userId);

    const { data: existing } = await this.supabase
      .from('travel_requirements')
      .select('id')
      .eq('trip_id', createDto.trip_id)
      .single();

    if (existing) {
      throw new ConflictException(
        'Ya existen requisitos de viaje para este viaje. Usa PUT para actualizar',
      );
    }

    const { data: rawData, error } = await this.supabase
      .from('travel_requirements')
      .insert({ ...createDto, last_updated: new Date().toISOString() })
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error al crear requisitos de viaje',
      );
    }

    return this.mapRecord(rawData as TravelRequirementsRecord);
  }

  async findByTrip(
    tripId: string,
    userId: string,
  ): Promise<TravelRequirementsResponseDto> {
    await this.verifyTripOwner(tripId, userId);

    const { data: rawData, error } = await this.supabase
      .from('travel_requirements')
      .select()
      .eq('trip_id', tripId)
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        `Requisitos de viaje para el viaje ${tripId} no encontrados`,
      );
    }

    return this.mapRecord(rawData as TravelRequirementsRecord);
  }

  async update(
    tripId: string,
    updateDto: UpdateTravelRequirementsDto,
    userId: string,
  ): Promise<TravelRequirementsResponseDto> {
    await this.verifyTripOwner(tripId, userId);

    const { data: rawData, error } = await this.supabase
      .from('travel_requirements')
      .update({ ...updateDto, last_updated: new Date().toISOString() })
      .eq('trip_id', tripId)
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error actualizando los requisitos de viaje',
      );
    }

    return this.mapRecord(rawData as TravelRequirementsRecord);
  }

  async remove(tripId: string, userId: string): Promise<{ message: string }> {
    await this.verifyTripOwner(tripId, userId);

    const { error } = await this.supabase
      .from('travel_requirements')
      .delete()
      .eq('trip_id', tripId);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: 'Requisitos de viaje eliminados correctamente' };
  }
}
