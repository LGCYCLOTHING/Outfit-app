import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = 'https://qrpzndpbuhlgvywgoywq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFycHpuZHBidWhsZ3Z5d2dveXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzE3MDAsImV4cCI6MjA5NDcwNzcwMH0.wiwT5sF0GszUa3L_oWT8rEpb0YI_yFrP3lo01kZKMDI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
