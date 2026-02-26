import { ActivityCategory } from 'src/common/enums/activity-category.enum';

export class LocationResponseDto {
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
