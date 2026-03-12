
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function search() {
    const { data: tournaments, error } = await supabase.from('tournaments').select('*');
    if (!error) {
        const filtered = tournaments.filter(t => t.data?.name?.toLowerCase().includes('bodeguero'));
        console.log('Search results in tournaments:', filtered.map(t => ({ id: t.id, name: t.data.name })));
    } else {
        console.error('Tournament fetch error:', error);
    }

    try {
        const { data: events, error: eError } = await supabase.from('events').select('*');
        if (!eError && events) {
            const filteredEvents = events.filter(e => e.name?.toLowerCase().includes('bodeguero') || e.data?.name?.toLowerCase().includes('bodeguero'));
            console.log('Search results in events:', filteredEvents.map(e => ({ id: e.id, name: e.name || e.data?.name })));
        } else if (eError) {
            console.log('Events table might not exist or error:', eError.message);
        }
    } catch (e) {
        console.log('Events check failed');
    }
}
search();
