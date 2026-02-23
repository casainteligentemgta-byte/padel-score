'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { Monitor, Layout, Maximize2, Radio, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function AdminMonitorPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const q = query(collection(db, 'tournaments'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allLiveMatches: any[] = [];
            snapshot.docs.forEach(docSnap => {
                const tournament = docSnap.data();
                if (tournament.matches) {
                    tournament.matches.forEach((m: any) => {
                        if (m.status === MatchStatus.LIVE || m.status === 'LIVE' || m.status === 'IN_PROGRESS') {
                            const team1 = m.team1Index > 0 ? tournament.teams?.[m.team1Index - 1] : null;
                            const team2 = m.team2Index > 0 ? tournament.teams?.[m.team2Index - 1] : null;

                            allLiveMatches.push({
                                ...m,
                                tournamentName: tournament.name,
                                tournamentId: docSnap.id,
                                t1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                                t2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                                primaryColor: tournament.broadcastingSettings?.primaryColor || '#ccff00'
                            });
                        }
                    });
                }
            });
            setMatches(allLiveMatches);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <div className="ipad-screen-container bg-[#080808] text-white relative">
            <Sidebar />

            <div className="ipad-scroll-area p-8 md:p-12 pl-24 md:pl-32">
                <header className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-3 bg-padel-primary/20 rounded-2xl border border-padel-primary/30">
                            <Monitor className="w-6 h-6 text-padel-primary" />
                        </div>
                        <h4 className="text-padel-primary font-black uppercase tracking-[0.3em] text-[10px] italic underline decoration-2">Panel Administrativo</h4>
                    </div>
                    <h1 className="text-5xl font-black italic uppercase tracking-tighter">
                        MONITOR <span className="text-padel-primary">DE CANCHAS</span>
                    </h1>
                    <p className="text-gray-500 mt-2 font-medium">Visualización en tiempo real de lo que ven los espectadores en los televisores.</p>
                </header>

                {matches.length === 0 ? (
                    <div className="h-[40vh] glass border-dashed border-2 border-white/5 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <Radio className="w-12 h-12 text-gray-800 mb-4 animate-pulse" />
                        <h2 className="text-2xl font-black italic uppercase text-gray-600">No hay transmisiones activas</h2>
                        <p className="text-gray-700 text-sm mt-2">Inicia un partido para visualizar la pizarra aquí.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {matches.map((m) => (
                            <div key={`${m.tournamentId}-${m.id}`} className="flex flex-col gap-4">
                                <div className="flex justify-between items-center px-4">
                                    <div className="flex items-center gap-3">
                                        <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
                                        <span className="text-xs font-black uppercase tracking-widest italic">{m.tournamentName} - Pista {m.court}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link
                                            href={`/tournaments/${m.tournamentId}/display/${m.id}`}
                                            target="_blank"
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all text-gray-400 hover:text-white"
                                            title="Abrir en pantalla completa"
                                        >
                                            <Maximize2 className="w-4 h-4" />
                                        </Link>
                                    </div>
                                </div>

                                {/* EL "ESPEJO" DE LA CANCHA (iframe o preview) */}
                                <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-white/10 bg-black group shadow-2xl">
                                    <iframe
                                        src={`/tournaments/${m.tournamentId}/display/${m.id}`}
                                        className="w-[1280px] h-[720px] origin-top-left border-none pointer-events-none"
                                        style={{
                                            width: '200%',
                                            height: '200%',
                                            transform: 'scale(0.5)',
                                            transformOrigin: '0 0'
                                        }}
                                        title={`Monitor Pista ${m.court}`}
                                    />

                                    {/* Overlay informativo */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                        <div className="bg-black/80 p-6 rounded-3xl border border-white/10 text-center">
                                            <p className="text-padel-primary font-black italic uppercase text-xl mb-4">{m.t1Name} vs {m.t2Name}</p>
                                            <div className="flex gap-4 justify-center">
                                                <div className="px-4 py-2 bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest leading-none">Status: LIVE</div>
                                                <div className="px-4 py-2 bg-padel-primary text-black rounded-xl text-[10px] font-black uppercase tracking-widest leading-none">Score: {m.points?.t1 || '0'}:{m.points?.t2 || '0'}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx global>{`
                .glass {
                    background: rgba(255, 255, 255, 0.02);
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                }
            `}</style>
        </div>
    );
}
