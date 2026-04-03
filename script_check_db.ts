import { createClient } from '@supabase/supabase-js';

async function check() {
  const supabase = createClient('https://cecwrpmoitxhfynpqhkc.supabase.co', '[SERVICE-ROLE-KEY]');
  const { data, error } = await supabase
    .from('cancha_publicidad')
    .select('cancha_id, venue_name')
    .ilike('venue_name', '%Margarita%');
  
  if (error) {
    console.error(error);
    return;
  }
  
  const counts: Record<string, number> = {};
  data?.forEach(r => {
    const k = `${r.venue_name} | ${r.cancha_id}`;
    counts[k] = (counts[k] || 0) + 1;
  });
  
  console.log(JSON.stringify(counts, null, 2));
}

check();
