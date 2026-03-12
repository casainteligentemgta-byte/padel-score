
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDate() {
    const { data: matches, error } = await supabase.from('tournament_matches').select('*');
    if (error) {
        console.error(error); return;
    }
    const filtered = matches.filter(m => m.data?.scheduledTime?.includes('2026-03-13'));
    console.log('Matches for 2026-03-13:', filtered.length);
    if (filtered.length > 0) {
        console.log('Tournament IDs found:', [...new Set(filtered.map(m => m.tournament_id))]);
    }
}
checkDate();
