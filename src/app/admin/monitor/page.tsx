'use client';

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { MatchStatus } from '@/types/tournament';
import { Monitor, Layout, Maximize2, Radio, ExternalLink, Clock, Zap, Megaphone, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/Sidebar';
import Link from 'next/link';

export default function AdminMonitorPage() {
    const [matches, setMatches] = useState<any[]>([]);
    const [recentFinished, setRecentFinished] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());
    const [generatingId, setGeneratingId] = useState<string | null>(null);
    const [chronicle, setChronicle] = useState<{ title: string, text: string } | null>(null);

    const calculateProb = (m: any) => {
        const t1Sets = m.sets?.t1 || 0;
        const t2Sets = m.sets?.t2 || 0;
        const t1Games = m.games?.t1 || 0;
        const t2Games = m.games?.t2 || 0;
        const t1Points = m.points?.t1 === 'Adv' ? 50 : parseInt(m.points?.t1) || 0;
        const t2Points = m.points?.t2 === 'Adv' ? 50 : parseInt(m.points?.t2) || 0;

        let base = 50;
        base += (t1Sets - t2Sets) * 15;
        base += (t1Games - t2Games) * 3;
        base += (t1Points - t2Points) * 0.5;

        const finalT1 = Math.min(95, Math.max(5, Math.round(base)));
        return { t1: finalT1, t2: 100 - finalT1 };
    };

    const generateChronicle = async (m: any) => {
        setGeneratingId(m.id);
        try {
            const prompt = `Actúa como un reportero deportivo de pádel de élite. Escribe una crónica épica, emocionante y profesional del siguiente partido finalizado:
            Torneo: ${m.tournamentName}
            Categoría: ${m.category}
            Pareja 1: ${m.t1Name}
            Pareja 2: ${m.t2Name}
            Marcador Final: Sets ${m.sets?.t1 || 0}-${m.sets?.t2 || 0}, Juegos ${m.games?.t1 || 0}-${m.games?.t2 || 0}
            
            Usa un tono heroico, menciona la intensidad en la pista y termina con una felicitación a los ganadores. La crónica debe tener un título llamativo y unos 2-3 párrafos de texto.`;

            const response = await fetch('/api/ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, role: 'reporter' })
            });
            const data = await response.json();
            const fullText = data.text || '';
            const lines = fullText.split('\n');
            const title = lines[0].replace(/Title:|Título:/i, '').trim() || "Crónica del Partido";
            const text = lines.slice(1).join('\n').trim() || fullText;

            setChronicle({ title, text });
        } catch (error) {
            console.error("Error generating chronicle:", error);
        } finally {
            setGeneratingId(null);
        }
    };

    useEffect(() => {
        const timer = setInterval(() => setNow(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const q = query(collection(db, 'tournaments'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const allLiveMatches: any[] = [];
            const allRecentFinished: any[] = [];

            snapshot.docs.forEach(docSnap => {
                const tournament = docSnap.data();
                if (tournament.matches) {
                    tournament.matches.forEach((m: any) => {
                        const team1 = m.team1Index > 0 ? tournament.teams?.[m.team1Index - 1] : null;
                        const team2 = m.team2Index > 0 ? tournament.teams?.[m.team2Index - 1] : null;
                        const mData = {
                            ...m,
                            tournamentName: tournament.name,
                            tournamentId: docSnap.id,
                            category: tournament.category,
                            t1Name: team1 ? `${team1.p1.name} / ${team1.p2.name}` : 'TBD',
                            t2Name: team2 ? `${team2.p1.name} / ${team2.p2.name}` : 'TBD',
                            startTime: m.actualStartTime?.toDate() || new Date(Date.now() - 1000 * 60 * 30)
                        };

                        if (m.status === MatchStatus.LIVE || m.status === 'LIVE' || m.status === 'IN_PROGRESS') {
                            allLiveMatches.push(mData);
                        } else if (m.status === MatchStatus.FINISHED || m.status === 'FINISHED') {
                            // Solo últimos 10 finalizados para no saturar
                            allRecentFinished.push(mData);
                        }
                    });
                }
            });

            setMatches(allLiveMatches);
            setRecentFinished(allRecentFinished.sort((a, b) => b.endTime?.toDate().getTime() - a.endTime?.toDate().getTime()).slice(0, 6));
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
                                                    <div className="px-6 py-3 bg-white/5 rounded-2xl border border-white/10 flex flex-col items-center">
                                                        <p className="text-[9px] font-bold text-gray-500 uppercase mb-1">AI Prediction</p>
                                                        <div className="flex items-center gap-2">
                                                            <div className="flex flex-col items-end">
                                                                <span className="text-[10px] font-bold text-padel-primary">T1</span>
                                                                <span className="text-lg font-black text-white">{calculateProb(m).t1}%</span>
                                                            </div>
                                                            <div className="w-12 h-1 bg-white/10 rounded-full relative overflow-hidden">
                                                                <div
                                                                    className="absolute inset-y-0 left-0 bg-padel-primary transition-all duration-1000"
                                                                    style={{ width: `${calculateProb(m).t1}%` }}
                                                                />
                                                            </div>
                                                            <div className="flex flex-col items-start">
                                                                <span className="text-[10px] font-bold text-blue-400">T2</span>
                                                                <span className="text-lg font-black text-white">{calculateProb(m).t2}%</span>
                                                            </div>
                                                        </div>
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

                {/* IA REPORTER SECTION */}
                <div className="mt-20 border-t border-white/5 pt-12 pb-20">
                    <header className="mb-8 flex justify-between items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Megaphone className="w-5 h-5 text-[#fb923c]" />
                                <h4 className="text-[#fb923c] font-black uppercase tracking-[0.3em] text-[9px] italic">Inteligencia Artificial</h4>
                            </div>
                            <h2 className="text-3xl font-black italic uppercase tracking-tighter">ÚLTIMAS <span className="text-[#fb923c]">CRÓNICAS ÉPICAS</span></h2>
                        </div>
                    </header>

                    {recentFinished.length === 0 ? (
                        <div className="p-12 glass border-dashed border border-white/5 rounded-[3rem] text-center text-gray-600 font-bold uppercase text-sm italic">
                            No hay partidos finalizados recientemente para reportar
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentFinished.map((m) => (
                                <div key={m.id} className="glass p-6 rounded-[2.5rem] border border-white/5 hover:border-[#fb923c]/30 transition-all flex flex-col justify-between group">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="px-3 py-1 bg-white/5 rounded-lg text-[9px] font-black uppercase text-gray-500">{m.category}</span>
                                            <span className="text-[9px] font-black text-gray-600">{m.endTime?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h4 className="text-white font-black italic uppercase text-lg leading-tight mb-2">
                                            {m.t1Name} vs {m.t2Name}
                                        </h4>
                                        <div className="flex items-center gap-2 mb-6 text-[#fb923c]">
                                            <Trophy className="w-3 h-3" />
                                            <span className="text-xs font-black italic">FINALIZADO • {m.sets?.t1 || 0}-{m.sets?.t2 || 0}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => generateChronicle(m)}
                                        disabled={generatingId === m.id}
                                        className="w-full py-4 bg-white/5 hover:bg-[#fb923c] hover:text-black rounded-2xl border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {generatingId === m.id ? (
                                            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Zap className="w-3 h-3" />
                                        )}
                                        {generatingId === m.id ? 'Redactando...' : 'Generar Crónica IA'}
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* MODAL PARA LA CRÓNICA */}
                <AnimatePresence>
                    {chronicle && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-xl">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="max-w-2xl w-full bg-[#111] border-2 border-[#fb923c]/30 rounded-[3rem] p-12 overflow-hidden relative"
                            >
                                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-transparent via-[#fb923c] to-transparent opacity-50" />
                                <div className="flex items-center gap-3 mb-8">
                                    <Megaphone className="w-6 h-6 text-[#fb923c]" />
                                    <span className="text-[#fb923c] font-black uppercase tracking-[0.4em] text-[10px]">Crónica Generada por IA Reporter</span>
                                </div>

                                <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-6 leading-tight">
                                    {chronicle.title}
                                </h1>

                                <div className="prose prose-invert max-w-none">
                                    <div className="text-gray-400 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                                        {chronicle.text}
                                    </div>
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button
                                        onClick={() => {
                                            const text = `🏆 *${chronicle.title}*\n\n${chronicle.text}\n\n_Generado por Smart Padel Pro_`;
                                            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                                        }}
                                        className="flex-1 py-4 bg-[#25D366] text-black rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        Compartir en WhatsApp
                                    </button>
                                    <button
                                        onClick={() => setChronicle(null)}
                                        className="px-8 py-4 bg-white/5 text-gray-400 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
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
