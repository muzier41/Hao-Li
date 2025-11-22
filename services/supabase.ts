import { createClient } from '@supabase/supabase-js';

const LOCAL_STORAGE_URL_KEY = 'supabase_project_url';
const LOCAL_STORAGE_ANON_KEY = 'supabase_anon_key';

export const getSupabaseConfig = () => {
  return {
    url: localStorage.getItem(LOCAL_STORAGE_URL_KEY) || '',
    key: localStorage.getItem(LOCAL_STORAGE_ANON_KEY) || ''
  };
};

export const saveSupabaseConfig = (url: string, key: string) => {
  localStorage.setItem(LOCAL_STORAGE_URL_KEY, url);
  localStorage.setItem(LOCAL_STORAGE_ANON_KEY, key);
  window.location.reload(); // Reload to re-init client
};

// Initialize client
const { url, key } = getSupabaseConfig();

export const supabase = (url && key) 
  ? createClient(url, key) 
  : null;

export const isSupabaseConfigured = () => !!supabase;