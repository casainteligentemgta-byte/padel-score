import { NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { requireAuth } from '@/lib/authServerSupabase';

export async function GET(req: Request) {
    const authResult = await requireAuth(req);
    if (authResult instanceof NextResponse) return authResult;
    try {
        // Carga Firebase solo en runtime
        const { db } = await import('@/lib/firebase');
        const [tournamentsSnap, expensesSnap, participantsSnap] = await Promise.all([
            getDocs(collection(db, 'tournaments')),
            getDocs(collection(db, 'expenses')),
            getDocs(collection(db, 'participants'))
        ]);

        const tournaments = tournamentsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const expenses = expensesSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const players = participantsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Resumen simplificado para no saturar el contexto de la IA
        const stats = {
            totalTournaments: tournaments.length,
            totalExpenses: expenses.reduce((acc: number, curr: any) => acc + (Number(curr.amount) || 0), 0),
            totalPlayers: players.length,
            categories: [...new Set(tournaments.map((t: any) => t.category))].filter(Boolean)
        };

        return NextResponse.json({
            status: 'success',
            stats,
            data: {
                tournaments: tournaments.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    category: t.category,
                    matchCount: t.matches?.length || 0,
                    status: t.status || 'Active'
                })),
                expensesSummary: expenses.slice(0, 50), // Solo los más recientes
                playersList: players.map((p: any) => ({ name: p.name, category: p.category }))
            }
        });
    } catch (error: any) {
        console.error('[api/insights] Error obteniendo datos para informe:', error);
        // En producción (ej. Vercel sin Firebase configurado) devolvemos datos vacíos
        // para no romper el build ni la app. El informe seguirá funcionando pero sin datos reales.
        const emptyStats = {
            totalTournaments: 0,
            totalExpenses: 0,
            totalPlayers: 0,
            categories: [] as string[]
        };
        return NextResponse.json({
            status: 'success',
            stats: emptyStats,
            data: {
                tournaments: [],
                expensesSummary: [],
                playersList: []
            }
        });
    }
}
