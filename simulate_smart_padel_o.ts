
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Falta configuración de Supabase en .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runSimulation() {
  console.log('🚀 Iniciando Simulación: Smart Padel O');

  // 1. Crear el Torneo
  const tournamentName = `Smart Padel O - ${new Date().toLocaleDateString()}`;
  const tournamentData = {
    name: tournamentName,
    type: 'KNOCKOUT',
    category: 'QUINTA',
    gender: 'MALE',
    startDate: new Date().toISOString(),
    inscriptionPrice: 25,
    inscriptionCategories: [
      { key: 'QUINTA', name: 'Quinta Masculina', price: 25, gender: 'MALE', maxSlots: 8 }
    ]
  };

  const { data: tournament, error: tError } = await supabase
    .from('tournaments')
    .insert([{
      owner_id: '00000000-0000-0000-0000-000000000000',
      data: tournamentData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (tError) {
    console.error('❌ Error creando torneo:', tError);
    return;
  }

  console.log(`✅ Torneo creado: ${tournament.id}`);

  // 2. Simular 8 Jugadores y sus inscripciones
  const players = [
    { name: 'Juan Perez', email: 'juan@example.com', code: 'JP1234' },
    { name: 'Carlos Ruiz', email: 'carlos@example.com', code: 'CR5678' },
    { name: 'Ricardo G.', email: 'ricardo@example.com', code: 'RG9012' },
    { name: 'Miguel A.', email: 'miguel@example.com', code: 'MA3456' },
    { name: 'Luis Sosa', email: 'luis@example.com', code: 'LS7890' },
    { name: 'Pedro Paez', email: 'pedro@example.com', code: 'PP1122' },
    { name: 'Daniel D.', email: 'daniel@example.com', code: 'DD3344' },
    { name: 'Jose M.', email: 'jose@example.com', code: 'JM5566' },
  ];

  console.log('📝 Inscribiendo 8 parejas (simuladas)...');

  for (let i = 0; i < players.length; i += 2) {
    const p1 = players[i];
    const p2 = players[i+1];

    // Simular perfiles si no existen
    await supabase.from('profiles').upsert([
      { id: `sim_${p1.code}`, name: p1.name, email: p1.email, unique_code: p1.code, role: 'player' },
      { id: `sim_${p2.code}`, name: p2.name, email: p2.email, unique_code: p2.code, role: 'player' }
    ]);

    // Crear Inscripción
    const { error: insError } = await supabase.from('inscriptions').insert({
      owner_id: `sim_${p1.code}`,
      tournament_id: tournament.id,
      tournament_name: tournamentName,
      category_key: 'QUINTA',
      category_price: 25,
      participant_name: p1.name,
      participant_email: p1.email,
      payment_status: 'paid',
      data: { partnerName: p2.name, partnerCode: p2.code },
      created_at: new Date().toISOString()
    });

    // Crear Equipo
    const { error: teamError } = await supabase.from('teams').insert({
      tournament_id: tournament.id,
      category: 'QUINTA',
      player_a_id: `sim_${p1.code}`, // Usando IDs simulados
      player_b_id: `sim_${p2.code}`,
      status: 'accepted',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    if (insError || teamError) {
      console.error(`❌ Error en pareja ${i/2 + 1}:`, insError || teamError);
    } else {
      console.log(`✨ Pareja ${i/2 + 1} inscrita: ${p1.name} & ${p2.name}`);
    }
  }

  console.log('\n--- 🏁 Simulación Completada ---');
  console.log(`Torneo ID: ${tournament.id}`);
  console.log('Los datos están listos en Supabase para ser visualizados en el Master Generator.');
  console.log('URL recomendada para ver el torneo:');
  console.log(`http://localhost:3000/tournaments/${tournament.id}`);
}

runSimulation();
