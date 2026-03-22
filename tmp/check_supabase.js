import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing env vars');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking tournaments...');
    const { data: tournaments, error: tError } = await supabase.from('tournaments').select('*');
    if (tError) console.error('Tournaments error:', tError);
    else console.log('Tournaments found:', tournaments.length);

    if (tournaments && tournaments.length > 0) {
        console.log('Sample tournament ID:', tournaments[0].id);
    }

    console.log('Checking admin_settings...');
    const { data: settings, error: sError } = await supabase.from('admin_settings').select('*');
    if (sError) console.error('Admin settings error:', sError);
    else console.log('Admin settings found:', settings.length);

    console.log('Checking sponsor_carousel...');
    const { data: sponsors, error: spError } = await supabase.from('sponsor_carousel').select('*');
    if (spError) console.error('Sponsor carousel error:', spError);
    else console.log('Sponsor carousel found:', sponsors.length);
}

check();
