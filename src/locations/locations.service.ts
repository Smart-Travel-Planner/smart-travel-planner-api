/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.provider';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationResponseDto } from './dto/location-response.dto';
import { ActivityCategory } from 'src/common/enums/activity-category.enum';

interface LocationRecord {
  id: string;
  name: string;
  address?: string;
  category: ActivityCategory;
  created_by?: string;
  is_verified?: boolean;
  lat: number;
  lng: number;
  rating?: number;
  place_id?: string;
}

@Injectable()
export class LocationsService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(
    createLocationDto: CreateLocationDto,
    userId: string,
  ): Promise<LocationResponseDto> {
    const { data: rawData, error } = await this.supabase
      .from('locations')
      .insert({ ...createLocationDto, created_by: userId, is_verified: false })
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error creando una ubicación',
      );
    }

    const data = rawData as LocationRecord;
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      category: data.category,
      created_by: data.created_by,
      is_verified: data.is_verified,
      lat: data.lat,
      lng: data.lng,
      rating: data.rating,
      place_id: data.place_id,
    };
  }

  async findAll(): Promise<LocationResponseDto[]> {
    const { data: rawData, error } = await this.supabase
      .from('locations')
      .select();

    if (error) {
      throw new NotFoundException(error.message);
    }

    return (rawData as LocationRecord[]).map((location) => ({
      id: location.id,
      name: location.name,
      address: location.address,
      category: location.category,
      created_by: location.created_by,
      is_verified: location.is_verified,
      lat: location.lat,
      lng: location.lng,
      rating: location.rating,
      place_id: location.place_id,
    }));
  }

  async findOne(id: string): Promise<LocationResponseDto> {
    const { data: rawData, error } = await this.supabase
      .from('locations')
      .select()
      .eq('id', id)
      .single();

    if (error || !rawData) {
      throw new NotFoundException(`Ubicación con id ${id} no encontrada`);
    }

    const data = rawData as LocationRecord;
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      category: data.category,
      created_by: data.created_by,
      is_verified: data.is_verified,
      lat: data.lat,
      lng: data.lng,
      rating: data.rating,
      place_id: data.place_id,
    };
  }

  async update(
    id: string,
    updateLocationDto: UpdateLocationDto,
    userId: string,
  ): Promise<LocationResponseDto> {
    const location = await this.findOne(id);

    if (location.created_by !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para editar esta ubicación',
      );
    }

    const { data: rawData, error } = await this.supabase
      .from('locations')
      .update(updateLocationDto)
      .eq('id', id)
      .select()
      .single();

    if (error || !rawData) {
      throw new NotFoundException(
        error?.message ?? 'Error actualizando la ubicación',
      );
    }

    const data = rawData as LocationRecord;
    return {
      id: data.id,
      name: data.name,
      address: data.address,
      category: data.category,
      created_by: data.created_by,
      is_verified: data.is_verified,
      lat: data.lat,
      lng: data.lng,
      rating: data.rating,
      place_id: data.place_id,
    };
  }

  async remove(id: string, userId: string): Promise<{ message: string }> {
    const location = await this.findOne(id);

    if (location.created_by !== userId) {
      throw new ForbiddenException(
        'No tienes permiso para borrar esta ubicación',
      );
    }

    const { error } = await this.supabase
      .from('locations')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException(error.message);
    }

    return { message: 'Ubicación borrada correctamente' };
  }
}
