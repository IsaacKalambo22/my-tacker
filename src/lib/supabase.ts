import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env file. See .env.example for reference.'
  );
}

if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  throw new Error(
    'Invalid NEXT_PUBLIC_SUPABASE_URL. Must be a valid HTTP or HTTPS URL. Please update your .env file with your actual Supabase project URL.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = ReturnType<typeof createClient>;
