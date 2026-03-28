import { createClient, SupabaseClient } from '@supabase/supabase-js';

let serviceClient: SupabaseClient | null = null;
let anonServerClient: SupabaseClient | null = null;

/**
 * Cliente de Supabase con service role (solo servidor).
 * Omite RLS; usar solo en rutas API cuando SUPABASE_SERVICE_ROLE_KEY está definida.
 */
export function getSupabaseServiceClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)?.trim();
  if (!url || !key) return null;
  if (!serviceClient) {
    serviceClient = createClient(url, key);
  }
  return serviceClient;
}

/** Cliente anónimo para el servidor (RLS). Útil cuando las políticas permiten lectura pública. */
export function getSupabaseAnonServerClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) return null;
  if (!anonServerClient) {
    anonServerClient = createClient(url, key);
  }
  return anonServerClient;
}
