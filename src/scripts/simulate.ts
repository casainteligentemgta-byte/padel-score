import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function simulateTournament() {
    console.log('Simulando creación de torneo en Supabase...');
    if (!supabaseUrl || !supabaseAnonKey) {
        console.error('Faltan variables de entorno NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY');
        return;
    }

    try {
        const tournament = {
            name: 'Torneo Apertura Simulation',
            type: 'AMERICANO_DUPLA',
            category: 'CUARTA',
            startDate: new Date().toISOString(),
            startTime: '08:00',
            endTime: '22:00',
            complexName: 'Padel Pro Center',
            totalCourts: 4,
            bufferMinutes: 15,
            teams: Array(8).fill(null).map((_, i) => ({ id: `t${i}`, name: `Pareja ${i + 1}` })),
            status: 'En Curso'
        };

        const { data: tData, error: tError } = await supabase
            .from('tournaments')
            .insert({
                owner_id: '00000000-0000-0000-0000-000000000000', // UUID dummy
                data: tournament,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .select('id')
            .single();

        if (tError) throw tError;
        const tournamentId = tData.id;
        console.log('¡Torneo simulado creado con éxito ID:', tournamentId);

        // Simular un gasto para el torneo
        const expense = {
            description: 'Bolas Wilson Simulation',
            amount: 150,
            category: 'Insumos',
            date: new Date().toISOString(),
            tournamentId: tournamentId,
        };

        const { error: eError } = await supabase
            .from('expenses')
            .insert({
                owner_id: '00000000-0000-0000-0000-000000000000',
                data: expense,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (eError) throw eError;
        console.log('¡Gasto simulado creado con éxito!');
    } catch (e) {
        console.error('Error en simulación:', e);
    }
}

// simulateTournament();
