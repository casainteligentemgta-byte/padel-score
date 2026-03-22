
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function listTournaments() {
    const { data: tournaments, error } = await supabase.from('tournaments').select('*');
    if (error) {
        console.error('Error:', error);
        return;
    }
    console.log('Tournaments:');
    tournaments.forEach(t => {
        console.log(`- ID: ${t.id} | Name: ${t.data.name}`);
    });
}

listTournaments();
