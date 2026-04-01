
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function findMatch() {
  const { data: matches, error } = await supabase
    .from('matches')
    .select('id, tournamentId')
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Recent Matches:');
  matches.forEach(m => {
    console.log(`URL: http://localhost:3001/tournaments/${m.tournamentId}/display/${m.id}`);
  });
}

findMatch();
