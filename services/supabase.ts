import { createClient } from '@supabase/supabase-js';

const PROJECT_URL = 'https://nccoipogzqgtawcjkbgg.supabase.co'; 
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jY29pcG9nenFndGF3Y2prYmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM3Nzc2OTIsImV4cCI6MjA3OTM1MzY5Mn0.55tzsaFQwpqiOPQtyyN2VkAx9ghwfxpHKqLLubKQKzo';

// Initialize the client directly with the hardcoded credentials
export const supabase = createClient(PROJECT_URL, ANON_KEY);

export const isSupabaseConfigured = () => true;