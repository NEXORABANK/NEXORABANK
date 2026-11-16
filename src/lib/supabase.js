// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("CRITICAL ERROR: Missing Supabase URL or Anon Key in .env file.");
}

// BANKING SECURITY UPGRADE: Use sessionStorage instead of localStorage.
// This forces the browser to forget the user the moment the tab/window is closed.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: window.sessionStorage, 
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});