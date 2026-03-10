
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function initScreens() {
    const screens = ['Cancha 1', 'Cancha 2', 'Cancha 3'];

    for (const name of screens) {
        const { data: existing } = await supabase
            .from('pantallas')
            .select('id')
            .eq('nombre', name)
            .maybeSingle();

        if (!existing) {
            console.log(`Creating screen: ${name}`);
            const { data, error } = await supabase
                .from('pantallas')
                .insert({ nombre: name, activa: true })
                .select();

            if (error) {
                console.error(`Error creating ${name}:`, error.message);
            } else {
                console.log(`Successfully created ${name}`);
            }
        } else {
            console.log(`Screen ${name} already exists`);
        }
    }
}

initScreens();
