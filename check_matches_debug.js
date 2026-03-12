
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMatches() {
    const tournamentId = '51ad6434-1c68-4706-a31f-5da35399ca2c';
    console.log('Checking matches for tournament:', tournamentId);

    const { data: matches, error } = await supabase
        .from('tournament_matches')
        .select('*')
        .eq('tournament_id', tournamentId);

    if (error) {
        console.error('Error fetching matches:', error);
        return;
    }

    console.log('Found matches count:', matches.length);
    if (matches.length > 0) {
        // Find a live match if any
        const liveMatch = matches.find(m => m.data?.status === 'LIVE' || m.data?.status === 'IN_PROGRESS' || m.data?.status === 'STARTED');
        if (liveMatch) {
            console.log('Found LIVE match:', JSON.stringify(liveMatch, null, 2));
        } else {
            console.log('No live matches found. Sample match data:', JSON.stringify(matches[0], null, 2));
        }
    }
}

checkMatches();
