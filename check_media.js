
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cecwrpmoitxhfynpqhkc.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNlY3dycG1vaXR4aGZ5bnBxaGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNTg1NTcsImV4cCI6MjA4NzYzNDU1N30.AovaTFBtSCB-b6EDoP4YR8u8CdiWGYzbsYR7WXpHcGk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMedia() {
  const { data, error } = await supabase
    .from('media_content')
    .select('*')
    .limit(50);

  if (error) {
    console.error('Error fetching media_content:', error);
    return;
  }

  console.log('--- Media Content ---');
  data.forEach(m => {
    console.log(`ID: ${m.id} | Tipo: ${m.tipo} | URL: ${m.url} | Name: ${m.nombre}`);
  });
}

checkMedia();
