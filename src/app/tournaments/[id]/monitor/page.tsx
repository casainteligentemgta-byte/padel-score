'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { dataService } from '@/lib/dataService';
import { MatchStatus } from '@/types/tournament';
import { Monitor, Wifi, WifiOff, Maximize2 } from 'lucide-react';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { getSupabaseClient } from '@/lib/supabase/client';

// ── Grid layouts según número de canchas activas ─────────────────────────────
// Máximo 6 canchas (La Margarita)
const GRID_CONFIG: Record<number, { cols: number; rows: number; className: string }> = {
    1: { cols: 1, rows: 1, className: 'grid-cols-1 grid-rows-1' },
    2: { cols: 2, rows: 1, className: 'grid-cols-2 grid-rows-1' },
    3: { cols: 3, rows: 1, className: 'grid-cols-3 grid-rows-1' },
    4: { cols: 2, rows: 2, className: 'grid-cols-2 grid-rows-2' },
    5: { cols: 3, rows: 2, className: 'grid-cols-3 grid-rows-2' },
    6: { cols: 3, rows: 2, className: 'grid-cols-3 grid-rows-2' },
};

interface ActiveMatch {
    id: string;
    court: number | string;
    team1Name: string;
    team2Name: string;
    status: MatchStatus;
}

export default function MonitorCanchas() {
    const id = useRouteSegment('id');
    const [tournament, setTournament] = useState<any>(null);
    const [activeMatches, setActiveMatches] = useState<ActiveMatch[]>([]);
    const [loading, setLoading] = useState(true);
    const [noCourtsAssigned, setNoCourtsAssigned] = useState(false);
    const [highlightedCourts, setHighlightedCourts] = useState<Record<string, number>>({});
    const [focusedIdx, setFocusedIdx] = useState<number | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // ── Fullscreen helper ──────────────────────────────────────────────────
    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    useEffect(() => {
        const handler = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handler);
        return () => document.removeEventListener('fullscreenchange', handler);
    }, []);

    // ── Supabase realtime: escuchar partidos LIVE ───────────────────────────
    useEffect(() => {
        if (!id) return;

        console.log('ID del Torneo:', id);
        setLoading(true);
        setNoCourtsAssigned(false);

        let currentTournament: any = null;
        let currentMatches: any[] = [];

        const validateAssignedCourts = async () => {
            try {
                const supabase = getSupabaseClient();
                if (!supabase) return;

                // Verificación explícita por tournament_id.
                const { data, error } = await supabase
                    .from('pizarra_cancha')
                    .select('court_number')
                    .eq('tournament_id', id);

                if (error) {
                    console.warn('[Monitor] Error cargando canchas asignadas:', error);
                    return;
                }

                console.log('[Monitor] Canchas asignadas (raw):', data);
                console.log('[Monitor] Total canchas asignadas:', data?.length ?? 0);
                console.log(
                    '[Monitor] Números de cancha asignados:',
                    (data || []).map((r: { court_number: number }) => r.court_number)
                );

                if (!data || data.length === 0) {
                    setNoCourtsAssigned(true);
                }
            } catch (err) {
                console.error('[Monitor] Excepción cargando canchas asignadas:', err);
            }
        };

        void validateAssignedCourts();

        const supabase = getSupabaseClient();
        const pizarraChannel = supabase
            ?.channel(`monitor-pizarra-${id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'pizarra_cancha', filter: `tournament_id=eq.${id}` },
                (payload) => {
                    const row = payload.new as { court_number?: number } | null;
                    const courtNumber = Number(row?.court_number);
                    if (!Number.isFinite(courtNumber)) return;
                    setHighlightedCourts((prev) => ({ ...prev, [String(courtNumber)]: Date.now() + 8000 }));
                }
            )
            .subscribe();

        const updateData = (t: any, ms: any[]) => {
            if (!t) return;
            setTournament(t);

            const numCanchas = Math.max(1, Number(t.totalCourts) || (t.courtNames?.length ?? 6));
            
            const resolveTeamName = (mTeam: any, teamIdx: number) => {
                const PLACEHOLDER_RE = /pareja|jugador|placeholder/i;
                if (mTeam && (mTeam.p1 || mTeam.p1Name || mTeam.teamLabel)) {
                    const p1 = (mTeam.p1Name || mTeam.p1?.name || '').trim();
                    const p2 = (mTeam.p2Name || mTeam.p2?.name || '').trim();
                    const hasReal = (p1 && !PLACEHOLDER_RE.test(p1)) || (p2 && !PLACEHOLDER_RE.test(p2));
                    if (hasReal) {
                        return [p1, p2].filter(Boolean).join(' · ') || '?';
                    }
                    if (mTeam.teamLabel) return mTeam.teamLabel;
                }
                const foundTeam = teamIdx > 0 ? (Array.isArray(t.teams) ? t.teams[teamIdx - 1] : null) : null;
                if (!foundTeam) return `Pareja ${teamIdx || '?'}`;
                return [(foundTeam.p1?.name || '').trim(), (foundTeam.p2?.name || '').trim()].filter(Boolean).join(' · ') || `Pareja ${teamIdx}`;
            };

            const processed: ActiveMatch[] = ms
                .filter((m: any) => m.status?.toString().toUpperCase() === 'LIVE')
                .map((m: any, idx: number) => {
                    return {
                        id: m.id || `match_${idx}`,
                        court: m.court ?? (m.courtIndex !== undefined ? m.courtIndex + 1 : idx + 1),
                        team1Name: resolveTeamName(m.team1, m.team1Index),
                        team2Name: resolveTeamName(m.team2, m.team2Index),
                        status: m.status,
                    };
                })
                .sort((a: ActiveMatch, b: ActiveMatch) => Number(a.court) - Number(b.court))
                .slice(0, numCanchas);

            setActiveMatches(processed);
            setLoading(false);
        };

        const unsubT = dataService.subscribeToTournament(id, (t) => {
            if (!t) { setLoading(false); return; }
            currentTournament = t;
            if (currentMatches.length > 0) updateData(currentTournament, currentMatches);
        });

        const unsubM = dataService.subscribeToMatches(id, (ms) => {
            currentMatches = ms || [];
            if (currentTournament) updateData(currentTournament, currentMatches);
            else if (ms === null || ms?.length === 0) setLoading(false);
        });

        return () => {
            if (pizarraChannel) pizarraChannel.unsubscribe();
            if (typeof unsubT === 'function') unsubT();
            if (typeof unsubM === 'function') unsubM();
        };
    }, [id]);

    useEffect(() => {
        const hasActiveHighlights = Object.keys(highlightedCourts).length > 0;
        if (!hasActiveHighlights) return;

        const timer = window.setInterval(() => {
            const now = Date.now();
            setHighlightedCourts((prev) => {
                const next: Record<string, number> = {};
                for (const [k, expiresAt] of Object.entries(prev)) {
                    if (expiresAt > now) next[k] = expiresAt;
                }
                return next;
            });
        }, 1000);

        return () => window.clearInterval(timer);
    }, [highlightedCourts]);

    const count = activeMatches.length;
    const gridCfg = GRID_CONFIG[Math.max(1, Math.min(count, 6))];

    // ── Loading ────────────────────────────────────────────────────────────
    if (loading) return (
        <div className="h-screen bg-black flex flex-col items-center justify-center gap-4">
            <Monitor className="w-12 h-12 text-[#ccff00] animate-pulse" />
            <p className="text-[#ccff00] font-black italic uppercase tracking-widest text-[11px]">
                Conectando Monitor...
            </p>
        </div>
    );

    // ── Sin partidos activos ───────────────────────────────────────────────
    if (noCourtsAssigned) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 text-center">
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#ccff00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Monitor Canchas</span>
                    <span className="text-[9px] text-gray-700 font-bold">— {tournament?.name || id}</span>
                </div>
                <button onClick={toggleFullscreen} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
            </div>

            <WifiOff className="w-16 h-16 text-gray-800" />
            <p className="text-xl font-black italic uppercase tracking-tighter text-white/20">
                No hay canchas asignadas a este torneo
            </p>
        </div>
    );

    // ── Sin partidos activos ───────────────────────────────────────────────
    if (count === 0) return (
        <div className="h-screen bg-[#050505] flex flex-col items-center justify-center gap-6 text-center">
            {/* Header mínimo */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-3 border-b border-white/[0.04]">
                <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-[#ccff00]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Monitor Canchas</span>
                    <span className="text-[9px] text-gray-700 font-bold">— {tournament?.name || id}</span>
                </div>
                <button onClick={toggleFullscreen} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all">
                    <Maximize2 className="w-3.5 h-3.5 text-gray-500" />
                </button>
            </div>

            <WifiOff className="w-16 h-16 text-gray-800" />
            <div>
                <p className="text-2xl font-black italic uppercase tracking-tighter text-white/10">Sin partidos en vivo</p>
                <p className="text-[11px] text-gray-700 font-bold mt-2 uppercase tracking-widest">
                    Las pizarras aparecerán automáticamente cuando se inicie un partido
                </p>
            </div>
            <div className="flex items-center gap-2 mt-4 px-4 py-2 bg-white/[0.02] border border-white/[0.05] rounded-xl">
                <span className="w-2 h-2 rounded-full bg-gray-700 animate-pulse" />
                <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest">Esperando partidos...</span>
            </div>
        </div>
    );

    // ── Monitor Grid ───────────────────────────────────────────────────────
    return (
        <div className="h-screen w-screen bg-black overflow-hidden flex flex-col">

            {/* ── Top bar (minimalist, se oculta en fullscreen focus) ─────── */}
            <AnimatePresence>
                {focusedIdx === null && (
                    <motion.header
                        initial={{ y: -40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -40, opacity: 0 }}
                        className="flex-shrink-0 flex items-center justify-between px-5 py-2 bg-[#080808] border-b border-white/[0.05] z-50"
                    >
                        <div className="flex items-center gap-3">
                            <Monitor className="w-4 h-4 text-[#ccff00]" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">
                                Monitor Canchas
                            </span>
                            <span className="text-[9px] text-gray-700 font-bold">
                                — {tournament?.name}
                            </span>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Live counter */}
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]" />
                                <span className="text-[9px] font-black text-red-400 uppercase tracking-widest">
                                    {count} {count === 1 ? 'cancha' : 'canchas'} en vivo
                                </span>
                            </div>

                            {/* Court pills */}
                            <div className="flex items-center gap-1">
                                {activeMatches.map((m) => (
                                    <span key={m.id} className="px-2 py-1 bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/20 rounded-lg text-[8px] font-black uppercase tracking-widest">
                                        P{m.court}
                                    </span>
                                ))}
                            </div>

                            {/* Fullscreen */}
                            <button
                                onClick={toggleFullscreen}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                                title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
                            >
                                <Maximize2 className="w-3.5 h-3.5 text-gray-400" />
                            </button>
                        </div>
                    </motion.header>
                )}
            </AnimatePresence>

            {/* ── Focused mode: solo una pizarra ─────────────────────────── */}
            <AnimatePresence mode="wait">
                {focusedIdx !== null ? (
                    <motion.div
                        key="focused"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        className="flex-1 relative"
                    >
                        {/* Escape button */}
                        <button
                            onClick={() => setFocusedIdx(null)}
                            className="absolute top-4 right-4 z-50 px-3 py-2 bg-black/80 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-300 hover:bg-white/10 transition-all backdrop-blur-md"
                        >
                            ✕ Volver al monitor
                        </button>
                        <CourtCell
                            match={activeMatches[focusedIdx]}
                            tournamentId={id}
                            isFocused={true}
                            onClick={() => setFocusedIdx(null)}
                            isHighlighted={false}
                        />
                    </motion.div>
                ) : (
                    /* ── Grid multi-cancha ───────────────────────────────── */
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`flex-1 grid ${gridCfg.className} gap-px bg-[#111]`}
                    >
                        {activeMatches.map((match, idx) => (
                            <CourtCell
                                key={match.id}
                                match={match}
                                tournamentId={id}
                                isFocused={false}
                                onClick={() => setFocusedIdx(idx)}
                                isHighlighted={Boolean(highlightedCourts[String(match.court)])}
                            />
                        ))}

                        {/* Celdas vacías para completar el grid (solo layout 5: hay 5 partidos en grid 3×2) */}
                        {count === 5 && (
                            <div className="bg-[#080808] flex items-center justify-center">
                                <div className="flex flex-col items-center gap-2 opacity-20">
                                    <Monitor className="w-8 h-8 text-gray-600" />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Sin partido</span>
                                </div>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ── CourtCell: iframe de la pizarra + overlay con info de cancha ──────────────
function CourtCell({
    match,
    tournamentId,
    isFocused,
    onClick,
    isHighlighted,
}: {
    match: ActiveMatch;
    tournamentId: string;
    isFocused: boolean;
    onClick: () => void;
    isHighlighted: boolean;
}) {
    const displayUrl = `/tournaments/${tournamentId}/display/${match.id}`;
    const [assigning, setAssigning] = useState<number | null>(null);

    const assignToCourt = async (courtNum: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setAssigning(courtNum);
        try {
            await fetch('/api/pizarra-cancha', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courtNumber: courtNum, tournamentId, matchId: match.id }),
            });
        } finally {
            setAssigning(null);
        }
    };

    return (
        <div
            className={`relative w-full h-full bg-black overflow-hidden group cursor-pointer ${isHighlighted ? 'ring-2 ring-emerald-400/80 ring-inset' : ''}`}
            onClick={onClick}
        >
            {/* Iframe de la pizarra completa */}
            <iframe
                src={displayUrl}
                className="w-full h-full border-0 pointer-events-none"
                title={`Pista ${match.court}`}
                loading="lazy"
                sandbox="allow-scripts allow-same-origin"
            />

            {/* Overlay top: badge + direcciones cortas (cancha 1/2/3) + ampliar */}
            <div className="absolute top-0 left-0 right-0 flex items-start justify-between gap-2 p-3 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_6px_red]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white">
                        PISTA {match.court}
                    </span>
                </div>

                <div className="pointer-events-auto flex items-center gap-2">
                    {!isFocused && [1, 2, 3].map((n) => (
                        <button
                            key={n}
                            type="button"
                            onClick={(e) => assignToCourt(n, e)}
                            disabled={assigning !== null}
                            className="px-2 py-1 rounded-lg bg-black/60 border border-white/10 text-[8px] font-bold uppercase text-white/70 hover:bg-[#ccff00]/20 hover:border-[#ccff00]/40 hover:text-[#ccff00] disabled:opacity-50 transition-colors"
                            title={`Usar en cancha ${n} → www.smartpadel58.com/p/${n}`}
                        >
                            {assigning === n ? '…' : n}
                        </button>
                    ))}
                    {!isFocused && (
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 px-2 py-1.5 rounded-xl bg-black/60 border border-white/10 backdrop-blur-md">
                            <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">
                                ↗ Ampliar
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Overlay bottom: nombres de equipos (siempre visible, pequeño) */}
            {!isFocused && (
                <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
                    <span className="text-[8px] font-black italic uppercase tracking-tight text-white/70 truncate max-w-[45%]">
                        {match.team1Name}
                    </span>
                    <span className="text-[7px] font-bold text-white/30 mx-2">vs</span>
                    <span className="text-[8px] font-black italic uppercase tracking-tight text-white/70 truncate max-w-[45%] text-right">
                        {match.team2Name}
                    </span>
                </div>
            )}

            {/* Hover glow border */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-[#ccff00]/30 transition-all duration-300 pointer-events-none rounded-sm" />
            {isHighlighted && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded-lg bg-emerald-500/20 border border-emerald-400/60 backdrop-blur-md pointer-events-none">
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-300">
                        Lista para entrar
                    </span>
                </div>
            )}
        </div>
    );
}
