import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function run() {
  const result = {};
  
  const { data: media } = await supabase.from('media_content').select('*').limit(20);
  result.media = media;

  const { data: screens } = await supabase.from('pantallas').select('*');
  result.screens = screens;

  const { data: estado } = await supabase.from('display_estado').select('*');
  result.estado = estado;

  fs.writeFileSync('tmp/debug_output.json', JSON.stringify(result, null, 2));
  console.log('Results written to tmp/debug_output.json');
}

run();
