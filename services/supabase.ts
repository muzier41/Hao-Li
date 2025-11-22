import { createClient } from '@supabase/supabase-js';

// 您可以将配置直接填在这里，或者配置在 .env 文件中 (VITE_SUPABASE_URL / VITE_SUPABASE_KEY)
// You can paste your config directly here, or use .env files.
const PROJECT_URL = process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE'; 
const ANON_KEY = process.env.SUPABASE_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

export const supabase = (PROJECT_URL && ANON_KEY && PROJECT_URL !== 'YOUR_SUPABASE_URL_HERE')
  ? createClient(PROJECT_URL, ANON_KEY) 
  : null;

export const isSupabaseConfigured = () => !!supabase;

// Helper to debug if needed
if (!supabase) {
  console.warn('Supabase is not configured. Please set SUPABASE_URL and SUPABASE_KEY in services/supabase.ts or .env file.');
}