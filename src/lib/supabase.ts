import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase URL or Anon Key is missing. Please configure your environment variables in Cloudflare Settings -> Environment variables.');
}

// Fallback to placeholder if missing to avoid breaking the build/load execution
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-project-ref.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
