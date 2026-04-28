import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface WineryProfile {
  id: string;
  created_at: string;

  domaine_name: string;
  contact_name: string;
  phone: string;
  email: string;
  website: string;
  town: string;
  address: string;
  appellation: string;
  territory: string;
  wine_types: string[];
  style_cues: string;
  flagship_product: string;
  is_organic: boolean;
  is_premium: boolean;
  is_sustainable: boolean;
  tasting_available: boolean;
  visit_available: boolean;
  direct_purchase: boolean;
  opening_times: string;
  reservation_required: boolean;
  whatsapp: boolean;
  where_to_buy: string;
  short_presentation: string;
  specialties: string;
  differentiators: string;
  is_published: boolean;
  is_seeded: boolean;
  slug: string;

  origin_scheme_type: 'AOP' | 'AOC' | 'IGP' | 'other' | 'none';
  appellation_name: string;
  protected_display_term: string;
  official_origin_verified: boolean;
  official_origin_logo_enabled: boolean;

  bio_ab: boolean;
  hve: boolean;
  terra_vitis: boolean;
  vegan: boolean;
  sustainable_claim: string;
  certification_notes: string;

  association_id: string;
  association_name: string;
  association_member_status: 'member' | 'pending' | 'none' | 'former';
  association_verified: boolean;
  association_badge_enabled: boolean;
  association_join_label: string;
  association_left_at: string | null;

  submission_status: 'draft' | 'submitted' | 'under_review' | 'ready_for_publication' | 'published';
  submitted_at: string | null;
  review_notes: string;
  publication_ready_at: string | null;

  preview_ready: boolean;
  public_card_ready: boolean;

  association_entry_path: 'none' | 'direct' | 'invite';
  association_invited_at: string | null;

  has_non_alcoholic: boolean;
}
