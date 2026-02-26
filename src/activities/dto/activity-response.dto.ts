import { ActivityCategory } from 'src/common/enums/activity-category.enum';

export class ActivityResponseDto {
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
