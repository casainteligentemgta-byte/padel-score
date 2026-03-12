import { createClient as createSupabaseClient, SupabaseClient } from '@supabase/supabase-js';

// Deep DEBUG for the user's issue
if (typeof window !== 'undefined') {
    console.log('--- SUPABASE ENV DEBUG ---');
    console.log('URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log('Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    console.log('URL value:', process.env.NEXT_PUBLIC_SUPABASE_URL);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
    if (!supabaseUrl || !supabaseAnonKey) {
        const errorMsg = `ERROR CONFIG: ${!supabaseUrl ? 'Falta URL. ' : ''}${!supabaseAnonKey ? 'Falta Key.' : ''}`;
        console.error(errorMsg);
        throw new Error(errorMsg);
    }
    if (!client) {
        client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    }
    return client;
}

/** Devuelve el cliente solo en el cliente y si las variables están configuradas (no lanza). */
export function getSupabaseClient(): SupabaseClient | null {
    if (typeof window === 'undefined') return null;
    if (!supabaseUrl || !supabaseAnonKey) {
        return null;
    }
    if (!client) client = createSupabaseClient(supabaseUrl, supabaseAnonKey);
    return client;
}
