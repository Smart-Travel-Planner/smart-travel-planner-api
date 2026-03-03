export class TripResponseDto {
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
