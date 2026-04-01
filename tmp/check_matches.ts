import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  const { data: tournaments, error: tError } = await supabase
    .from('tournaments')
    .select('id, name')
    .limit(1)

  if (tError) {
    console.error('Tournaments error:', tError)
    return
  }

  if (!tournaments || tournaments.length === 0) {
    console.log('No tournaments found')
    return
  }

  const tid = tournaments[0].id
  console.log('Tournament:', tournaments[0].name, '(' + tid + ')')

  const { data: matches, error: mError } = await supabase
    .from('matches')
    .select('id, team1_id, team2_id')
    .eq('tournament_id', tid)
    .limit(5)

  if (mError) {
    console.error('Matches error:', mError)
    return
  }

  if (!matches || matches.length === 0) {
    console.log('No matches found for this tournament')
    return
  }

  matches.forEach(m => {
    console.log(`URL: http://localhost:3001/tournaments/${tid}/display/${m.id}`)
  })
}

main()
