'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { Monitor, Layout, Maximize2, Radio, ExternalLink, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function AdminMonitorPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

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

                            // Calcular inicio (si no existe, estimamos 30 mins atras para demo)
                            const startTime = m.actualStartTime?.toDate() || new Date(Date.now() - 1000 * 60 * 30);

                            allLiveMatches.push({
                                ...m,
                                tournamentName: tournament.name,
                                tournamentId: docSnap.id,
                                t1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                                t2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                                primaryColor: tournament.broadcastingSettings?.primaryColor || '#ccff00',
                                startTime
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
                        {matches.map((m) => {
                            const diff = Math.max(0, now.getTime() - m.startTime.getTime());
                            const hours = Math.floor(diff / (1000 * 60 * 60));
                            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                            const durationStr = hours > 0
                                ? `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
                                : `${minutes}:${seconds.toString().padStart(2, '0')}`;

                            return (
                                <div key={`${m.tournamentId}-${m.id}`} className="flex flex-col gap-4">
                                    <div className="flex justify-between items-end px-4">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-3">
                                                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]" />
                                                <span className="text-[10px] font-black uppercase tracking-[0.2em] italic text-gray-400">{m.tournamentName}</span>
                                            </div>
                                            <h3 className="text-xl font-black italic uppercase tracking-tighter">PISTA {m.court}</h3>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex flex-col items-end">
                                                <div className="flex items-center gap-2 text-padel-primary">
                                                    <Clock className="w-3 h-3" />
                                                    <span className="text-sm font-black tabular-nums">{durationStr}</span>
                                                </div>
                                                <span className="text-[9px] font-bold text-gray-600 uppercase">Duración Partido</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link
                                                    href={`/tournaments/${m.tournamentId}/display/${m.id}`}
                                                    target="_blank"
                                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-gray-400 hover:text-white"
                                                    title="Abrir en pantalla completa"
                                                >
                                                    <Maximize2 className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                    </div>

                                    {/* EL "ESPEJO" DE LA CANCHA (iframe o preview) */}
                                    <div className="relative aspect-video rounded-[3rem] overflow-hidden border-4 border-white/5 bg-black group shadow-2xl transition-all hover:border-padel-primary/30">
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
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col items-center justify-center backdrop-blur-md">
                                            <div className="bg-black/80 p-8 rounded-[3rem] border border-white/10 text-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                                                <div className="flex items-center justify-center gap-2 mb-2 text-padel-primary">
                                                    <Radio className="w-4 h-4 animate-pulse" />
                                                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">En Vivo</span>
                                                </div>
                                                <p className="text-white font-black italic uppercase text-2xl mb-1">{m.t1Name}</p>
                                                <p className="text-gray-500 font-bold italic uppercase text-sm mb-1">VS</p>
                                                <p className="text-white font-black italic uppercase text-2xl mb-6">{m.t2Name}</p>

                                                <div className="flex gap-4 justify-center">
                                                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10">
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">Inicio</p>
                                                        <p className="text-sm font-black text-white">{m.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                                    </div>
                                                    <div className="px-6 py-3 bg-padel-primary rounded-2xl shadow-[0_10px_20px_rgba(204,255,0,0.3)]">
                                                        <p className="text-[9px] font-bold text-black/60 uppercase mb-1">Marcador</p>
                                                        <p className="text-xl font-black text-black">{m.points?.t1 || '0'}:{m.points?.t2 || '0'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
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
