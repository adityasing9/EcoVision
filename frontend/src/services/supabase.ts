import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://noloxywukfmeeevvmtsf.supabase.co";
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vbG94eXd1a2ZtZWVldnZtdHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA5MjMyMDksImV4cCI6MjEwNjQ5OTIwOX0.J1IdYmJXmewSi4YvlEApVcH-ZafmHygyIts_6-pmLqU";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
