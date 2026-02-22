import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

async function simulateTournament() {
    console.log('Simulando creación de torneo...');
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
            ownerId: 'dev-user-123',
            status: 'En Curso'
        };

        const docRef = await addDoc(collection(db, 'tournaments'), {
            ...tournament,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });

        console.log('¡Torneo simulado creado con éxito ID:', docRef.id);

        // Simular un gasto para el torneo
        await addDoc(collection(db, 'expenses'), {
            description: 'Bolas Wilson Simulation',
            amount: 150,
            category: 'Insumos',
            date: new Date().toISOString(),
            ownerId: 'dev-user-123',
            tournamentId: docRef.id,
            createdAt: serverTimestamp()
        });

        console.log('¡Gasto simulado creado con éxito!');
    } catch (e) {
        console.error('Error en simulación:', e);
    }
}

// simulateTournament();
