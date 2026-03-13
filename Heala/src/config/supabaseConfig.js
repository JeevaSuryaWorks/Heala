import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// NOTE: Service role key should only be used in trusted environments
export const SUPABASE_SERVICE_ROLE = import.meta.env.VITE_SUPABASE_SERVICE_ROLE;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
