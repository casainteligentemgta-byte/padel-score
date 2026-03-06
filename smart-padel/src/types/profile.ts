export interface Profile {
  id: string;
  full_name: string | null;
  birth_date: string | null; // ISO date (YYYY-MM-DD)
  skill_level: number;
  phone_number: string | null;
  created_at?: string;
  updated_at?: string;
}
