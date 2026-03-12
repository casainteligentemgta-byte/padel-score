import { createClient } from './src/lib/supabase/client';

async function checkColumns() {
  const supabase = createClient();
  
  console.log('--- Tira Informativa ---');
  const { data: tira, error: errorTira } = await supabase.from('tira_informativa').select('*').limit(1);
  if (errorTira) console.error('Error Tira:', errorTira);
  else console.log('Columns:', tira.length > 0 ? Object.keys(tira[0]) : 'No data');

  console.log('--- Media Content ---');
  const { data: media, error: errorMedia } = await supabase.from('media_content').select('*').limit(1);
  if (errorMedia) console.error('Error Media:', errorMedia);
  else console.log('Columns:', media.length > 0 ? Object.keys(media[0]) : 'No data');
}

checkColumns();
