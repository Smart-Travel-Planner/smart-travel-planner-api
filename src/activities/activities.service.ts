/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { ActivityResponseDto } from './dto/activity-response.dto';
import { ActivityCategory } from 'src/common/enums/activity-category.enum';

interface ActivityRecord {
  id: string;
  title: string;
  trip_id: string;
  location_id?: string;
  start_time: string;
  end_time?: string;
  cost: number;
  user_notes?: string;
  category: ActivityCategory;
}

interface TripRecord {
  id: string;
  user_id: string;
  is_public: boolean;
}

@Injectable()
export class ActivitiesService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  private mapActivity = (activity: ActivityRecord): ActivityResponseDto => ({
    id: activity.id,
    title: activity.title,
    trip_id: activity.trip_id,
    location_id: activity.location_id,
    start_time: activity.start_time,
    end_time: activity.end_time,
    cost: activity.cost,
    user_notes: activity.user_notes,
    category: activity.category,
  });

  private async verifyTripAccess(
    tripId: string,
    userId: string,
  ): Promise<void> {
    const { data: rawData, error } = await this.supabase
      .from('trips')
      .select('id, user_id, is_public')
      .eq('id', tripId)
      .single();

    if (error || !rawData) {
      throw new NotFoundException(`Viaje con id ${tripId} no encontrado`);
    }

    const trip = rawData as TripRecord;

    if (trip.user_id === userId) {
      return;
    }

    if (trip.is_public) {
      return;
    }
    const { data: member } = await this.supabase
      .from('trip_members')
      .select('id')
      .eq('trip_id', tripId)
      .eq('user_id', userId)
      .single();

    if (!member) {
      throw new ForbiddenException('No tienes acceso a este viaje');
    }
  }

  async create(
    createActivityDto: CreateActivityDto,
    userId: string,
  ): Promise<ActivityResponseDto> {
    await this.verifyTripAccess(createActivityDto.trip_id, userId);

    const { data: rawData, error } = await this.supabase
      .from('activities')
      .insert({
        ...createActivityDto,
        location_id: createActivityDto.location_id ?? null,
        end_time: createActivityDto.end_time ?? null,
        user_notes: createActivityDto.user_notes ?? null,
      })
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error creando la actividad',
      );
    }

    return this.mapActivity(rawData as ActivityRecord);
  }

  async findByTrip(
    tripId: string,
    userId: string,
  ): Promise<ActivityResponseDto[]> {
    await this.verifyTripAccess(tripId, userId);

    const { data: rawData, error } = await this.supabase
      .from('activities')
      .select()
      .eq('trip_id', tripId);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return (rawData as ActivityRecord[]).map(this.mapActivity);
  }

  async findOne(id: string, userId: string): Promise<ActivityResponseDto> {
    const { data: rawData, error } = await this.supabase
      .from('activities')
      .select()
      .eq('id', id)
      .single();

    if (error || !rawData) {
      throw new NotFoundException(`Actividad con id ${id} no encontrada`);
    }

    const activity = rawData as ActivityRecord;
    await this.verifyTripAccess(activity.trip_id, userId);

    return this.mapActivity(activity);
  }

  async update(
    id: string,
    updateActivityDto: UpdateActivityDto,
    userId: string,
  ): Promise<ActivityResponseDto> {
    await this.findOne(id, userId);

    const { data: rawData, error } = await this.supabase
      .from('activities')
      .update(updateActivityDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error actualizando la actividad',
      );
    }

    return this.mapActivity(rawData as ActivityRecord);
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    await this.findOne(id, userId);

    const { error } = await this.supabase
      .from('activities')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: 'Actividad borrada correctamente' };
  }
}
