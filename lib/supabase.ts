import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 테이블 이름 상수
export const TABLES = {
  SLIDE_SETTINGS: 'slide_settings',
  MAP_MARKERS: 'map_markers',
  RESCUE_STATS: 'rescue_stats',
  IMAGE_SLIDES: 'image_slides',
} as const;
