/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { CreateTripDto } from './dto/create-trip.dto';
import { UpdateTripDto } from './dto/update-trip.dto';
import { TripResponseDto } from './dto/trip-response.dto';

interface TripRecord {
  id: string;
  title: string;
  destination?: string;
  user_id: string;
  image_url?: string;
  start_date: string;
  end_date?: string;
  total_budget: number;
  is_public: boolean;
  created_at: string;
}

@Injectable()
export class TripsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(
    createTripDto: CreateTripDto,
    userId: string,
  ): Promise<TripResponseDto> {
    const { data: rawData, error } = await this.supabase
      .from('trips')
      .insert({
        ...createTripDto,
        user_id: userId,
        is_public: createTripDto.is_public ?? false,
      })
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(error?.message ?? 'Error creando el viaje');
    }

    const data = rawData as TripRecord;
    return {
      id: data.id,
      title: data.title,
      destination: data.destination,
      user_id: data.user_id,
      image_url: data.image_url,
      start_date: data.start_date,
      end_date: data.end_date,
      total_budget: data.total_budget,
      is_public: data.is_public,
      created_at: data.created_at,
    };
  }

  async findAll(): Promise<TripResponseDto[]> {
    const { data: rawData, error } = await this.supabase
      .from('trips')
      .select()
      .eq('is_public', true);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return (rawData as TripRecord[]).map((trip) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      user_id: trip.user_id,
      image_url: trip.image_url,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      is_public: trip.is_public,
      created_at: trip.created_at,
    }));
  }

  async findMyTrips(userId: string): Promise<TripResponseDto[]> {
    const { data: rawData, error } = await this.supabase
      .from('trips')
      .select()
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return (rawData as TripRecord[]).map((trip) => ({
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      user_id: trip.user_id,
      image_url: trip.image_url,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      is_public: trip.is_public,
      created_at: trip.created_at,
    }));
  }

  async findOne(id: string, userId: string): Promise<TripResponseDto> {
    const { data: rawData, error } = await this.supabase
      .from('trips')
      .select()
      .eq('id', id)
      .single();

    if (error || !rawData) {
      throw new NotFoundException(`Viaje con id ${id} no encontrado`);
    }

    const trip = rawData as TripRecord;

    if (!trip.is_public && trip.user_id !== userId) {
      throw new ForbiddenException('No tienes acceso a este viaje');
    }

    return {
      id: trip.id,
      title: trip.title,
      destination: trip.destination,
      user_id: trip.user_id,
      image_url: trip.image_url,
      start_date: trip.start_date,
      end_date: trip.end_date,
      total_budget: trip.total_budget,
      is_public: trip.is_public,
      created_at: trip.created_at,
    };
  }

  async update(
    id: string,
    updateTripDto: UpdateTripDto,
    userId: string,
  ): Promise<TripResponseDto> {
    const trip = await this.findOne(id, userId);

    if (trip.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para editar este viaje');
    }

    const { data: rawData, error } = await this.supabase
      .from('trips')
      .update(updateTripDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error actualizando el viaje',
      );
    }

    const data = rawData as TripRecord;
    return {
      id: data.id,
      title: data.title,
      destination: data.destination,
      user_id: data.user_id,
      image_url: data.image_url,
      start_date: data.start_date,
      end_date: data.end_date,
      total_budget: data.total_budget,
      is_public: data.is_public,
      created_at: data.created_at,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const trip = await this.findOne(id, userId);

    if (trip.user_id !== userId) {
      throw new ForbiddenException('No tienes permiso para borrar este viaje');
    }

    const { error } = await this.supabase.from('trips').delete().eq('id', id);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: 'Viaje borrado correctamente' };
  }
}
