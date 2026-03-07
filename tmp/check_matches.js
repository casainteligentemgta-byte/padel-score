import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    const tournamentId = 'f9fb0f89-dee3-4fab-8040-397173aa292a';
    console.log(`Checking matches for tournament ${tournamentId}...`);
    const { data: matches, error: mError } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId);

    if (mError) console.error('Matches error:', mError);
    else {
        console.log('Matches found:', matches.length);
        if (matches.length > 0) {
            console.log('Sample match ID:', matches[0].id);
        }
    }
}

check();
