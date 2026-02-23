'use client';

import { useState, useEffect, use } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { MonitorOff, Megaphone } from 'lucide-react';

export default function CourtDisplayPage({ params }: { params: Promise<{ courtId: string }> }) {
    const { courtId } = use(params);
    const [activeMatch, setActiveMatch] = useState<{ tournamentId: string, matchId: string } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Escuchamos todos los torneos para encontrar el partido vivo en esta pista
        const q = query(collection(db, 'tournaments'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            let found = false;
            snapshot.docs.forEach(docSnap => {
                const tournament = docSnap.data();
                if (tournament.matches) {
                    const liveMatch = tournament.matches.find((m: any) =>
                        m.court === parseInt(courtId) &&
                        (m.status === MatchStatus.LIVE || m.status === 'LIVE' || m.status === 'IN_PROGRESS')
                    );

                    if (liveMatch) {
                        setActiveMatch({
                            tournamentId: docSnap.id,
                            matchId: liveMatch.id
                        });
                        found = true;
                    }
                }
            });

            if (!found) setActiveMatch(null);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [courtId]);

    if (loading) return (
        <div className="h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-padel-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic">Buscando Señal...</p>
            </div>
        </div>
    );

    if (!activeMatch) {
        return (
            <div className="h-screen w-screen bg-[#050505] flex flex-col items-center justify-center text-white font-outfit relative">
                <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_#ccff00_0%,_transparent_70%)]" />

                <div className="relative z-10 flex flex-col items-center gap-8">
                    <div className="p-12 bg-white/5 rounded-[4rem] border border-white/10 shadow-2xl backdrop-blur-xl relative">
                        <MonitorOff className="w-24 h-24 text-gray-700 animate-pulse" />
                        <div className="absolute -top-4 -right-4 bg-padel-primary text-black px-6 py-2 rounded-2xl font-black italic uppercase text-sm shadow-[0_10px_20px_rgba(204,255,0,0.3)]">
                            PISTA {courtId}
                        </div>
                    </div>

                    <div className="text-center">
                        <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">SEÑAL EN <span className="text-padel-primary">ESPERA</span></h1>
                        <p className="text-gray-500 font-bold uppercase tracking-[0.4em] text-sm">No hay partidos en curso actualmente</p>
                    </div>

                    <div className="mt-12 flex items-center gap-4 px-8 py-4 bg-white/5 rounded-2xl border border-white/10">
                        <Megaphone className="w-5 h-5 text-padel-primary" />
                        <p className="text-xs font-black uppercase tracking-widest text-gray-400">Pronto volveremos con la mejor acción</p>
                    </div>
                </div>

                {/* Footer simple branding */}
                <div className="absolute bottom-12 text-center opacity-20">
                    <p className="font-black italic uppercase tracking-[0.5em] text-xs">Smart Padel Pro System</p>
                </div>

                <style jsx global>{`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                    body { background: #050505; margin: 0; overflow: hidden; }
                `}</style>
            </div>
        );
    }

    // Si hay un partido, usamos el componente de visualización completa
    // Para no duplicar código, lo suyo es mover FullScreenDisplay a un componente reutilizable.
    // Por ahora, redirigiremos internamente para asegurar que funciona, o implementamos el render aquí.
    return <RedirectToMatch tournamentId={activeMatch.tournamentId} matchId={activeMatch.matchId} />;
}

// Un pequeño helper para manejar el render
function RedirectToMatch({ tournamentId, matchId }: { tournamentId: string, matchId: string }) {
    useEffect(() => {
        // Podríamos redirigir, pero si queremos que el enlace sea FIJO en la barra del navegador de la TV,
        // lo mejor es inyectar el componente.
        // Voy a mover la lógica de FullScreenDisplay a un componente reutilizable a continuación.
    }, []);

    // De momento, renderizaremos una redirección simple o mirror
    return (
        <iframe
            src={`/tournaments/${tournamentId}/display/${matchId}`}
            className="w-screen h-screen border-none overflow-hidden"
        />
    );
}
