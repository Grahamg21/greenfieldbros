import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anonKey = process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

// Public client — for reads
export const supabase = createClient(url, anonKey);

// Admin client — bypasses RLS, used for server-side writes (sync)
export const supabaseAdmin = createClient(url, serviceKey ?? anonKey);
