require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
async function run() {
    const { data: matches, error } = await supabase
        .from('tournament_matches')
        .select('*')
        .in('tournament_id', ['f2d283a8-0698-4532-848b-fef56e55aa02', '51ad6434-1c68-4706-a31f-5da35399ca2c']);
    if (error) {
        console.error(error);
    } else {
        const live = (matches || []).filter(r => {
            const m = r.data || {};
            return m.status === 'LIVE' || m.status === 'IN_PROGRESS' || m.status === 'STARTED';
        });
        console.log(JSON.stringify(live, null, 2));
    }
}
run();
