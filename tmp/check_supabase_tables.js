import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    console.log('Checking display_estado...');
    const { data: display, error: dError } = await supabase.from('display_estado').select('*');
    if (dError) console.error('Display estado error:', dError);
    else console.log('Display estado found:', display.length);

    console.log('Checking media_content...');
    const { data: media, error: mError } = await supabase.from('media_content').select('*');
    if (mError) console.error('Media content error:', mError);
    else console.log('Media content found:', media.length);

    console.log('Checking pantallas...');
    const { data: pantallas, error: pError } = await supabase.from('pantallas').select('*');
    if (pError) console.error('Pantallas error:', pError);
    else console.log('Pantallas found:', pantallas.length);
}

check();
