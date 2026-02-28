'use client';

import { useState, useEffect, use } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { rtdb } from '@/lib/rtdb';
import { ref, onValue, off } from 'firebase/database';
import {
    activarCancha,
    desactivarCancha,
    actualizarMarcador,
    setModoPuntos,
} from '@/lib/rtdbService';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Crosshair, Wifi, WifiOff, ChevronUp, ChevronDown,
    Play, Square, RefreshCw, Shield, Trophy, Zap, Star, AlertCircle
} from 'lucide-react';
import { getCanchaLabel } from '@/lib/markerCanchas';
import Link from 'next/link';

const PUNTOS_NORMAL = ['0', '15', '30', '40', 'AD'];
const PUNTOS_TB = Array.from({ length: 21 }, (_, i) => String(i)); // 0..20 (más que suficiente)
const NUM_CANCHAS = 6;

export default function MarkerControlPage({ params }: { params: Promise<{ canchaId: string }> }) {
    const { canchaId } = use(params);
    const { user, profile, canMarkInCancha, markerCanchas } = useAuth();
    const router = useRouter();
    const [accessDenied, setAccessDenied] = useState(false);

    const [canchaData, setCanchaData] = useState<any>(null);
    const [loadingCancha, setLoadingCancha] = useState(true);
    const [activando, setActivando] = useState(false);
    const [equipo1, setEquipo1] = useState({ nombre: 'Equipo 1', color: '#CCFF00' });
    const [equipo2, setEquipo2] = useState({ nombre: 'Equipo 2', color: '#FF5500' });
    const [showSetup, setShowSetup] = useState(false);

    const canchaLabel = canchaId; // ej: "cancha_1"
    const canchaNum = canchaId.split('_')[1];
    const isEnVivo = canchaData?.estado === 'en_vivo';
    const marcador = canchaData?.marcador;

    // ── Guard: solo admin o marcador autorizado para esta cancha ───────────
    useEffect(() => {
        if (!user) {
            router.replace('/');
            return;
        }
        if (!canMarkInCancha(canchaId)) {
            setAccessDenied(true);
        }
    }, [user, canchaId, canMarkInCancha]);

    // ── Escuchar estado de la cancha en RTDB ───────────────────────────────
    useEffect(() => {
        const canchaRef = ref(rtdb, `canchas/${canchaId}`);
        const handler = (snap: any) => {
            setCanchaData(snap.val());
            setLoadingCancha(false);
        };
        onValue(canchaRef, handler, (err) => {
            console.error(`[Marker] Error leyendo cancha ${canchaId}:`, err);
            setLoadingCancha(false);
        });
        return () => off(canchaRef, 'value', handler);
    }, [canchaId]);

    // ── Activar partido ────────────────────────────────────────────────────
    const handleActivar = async () => {
        if (!user) return;
        setActivando(true);
        try {
            await activarCancha(
                canchaId,
                user.uid,
                profile?.name || user.email || 'Marker',
                '', // torneoId: se puede conectar luego con el fixture
                `live_${Date.now()}`,
                equipo1,
                equipo2,
            );
            setShowSetup(false);
        } catch (err) {
            console.error('[Marker] Error activando cancha:', err);
            alert('Error al activar la cancha. Intenta de nuevo.');
        } finally {
            setActivando(false);
        }
    };

    // ── Desactivar partido ────────────────────────────────────────────────
    const handleDesactivar = async () => {
        if (!confirm('¿Terminar el partido y poner la cancha en espera?')) return;
        try {
            await desactivarCancha(canchaId);
        } catch (err) {
            console.error('[Marker] Error desactivando cancha:', err);
        }
    };

    // ── Operaciones de puntos ─────────────────────────────────────────────
    const cambiarPunto = async (equipo: 'local' | 'visitante', delta: 1 | -1) => {
        if (!marcador) return;
        const puntosActual = marcador.puntos;
        const actual = puntosActual[equipo];
        const modo = marcador.modo_puntos || 'normal';
        const secuencia = modo === 'normal' ? PUNTOS_NORMAL : PUNTOS_TB;

        const idx = secuencia.indexOf(actual);
        const baseIdx = idx === -1 ? 0 : idx;
        const newIdx = Math.max(0, Math.min(secuencia.length - 1, baseIdx + delta));

        await actualizarMarcador(canchaId, {
            puntos: { ...puntosActual, [equipo]: secuencia[newIdx] },
        });
    };

    const cambiarGame = async (equipo: 'local' | 'visitante', delta: 1 | -1) => {
        if (!marcador) return;
        const nuevo = Math.max(0, (marcador.games[equipo] || 0) + delta);
        await actualizarMarcador(canchaId, {
            games: { ...marcador.games, [equipo]: nuevo },
            puntos: { local: '0', visitante: '0' },
        });
    };

    const cambiarSet = async (equipo: 'local' | 'visitante', delta: 1 | -1) => {
        if (!marcador) return;
        const nuevo = Math.max(0, (marcador.sets[equipo] || 0) + delta);
        await actualizarMarcador(canchaId, {
            sets: { ...marcador.sets, [equipo]: nuevo },
            games: { local: 0, visitante: 0 },
            puntos: { local: '0', visitante: '0' },
        });
    };

    const toggleGoldenPoint = async () => {
        if (!marcador) return;
        await actualizarMarcador(canchaId, { golden_point: !marcador.golden_point });
    };

    // ── Acceso denegado a esta cancha ───────────────────────────────────────
    if (accessDenied) {
        const canchaLabel = getCanchaLabel(canchaId);
        return (
            <div className="min-h-screen bg-[#050505] text-white font-outfit flex flex-col items-center justify-center px-6">
                <div className="max-w-sm w-full text-center space-y-6">
                    <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
                        <AlertCircle className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black uppercase tracking-wide text-white mb-2">
                            Sin acceso a {canchaLabel}
                        </h1>
                        <p className="text-sm text-gray-400">
                            No tienes permiso para marcar en esta pista. Solo puedes usar las canchas que te asignó el administrador.
                            {markerCanchas.length > 0 && (
                                <span className="block mt-2 text-gray-500 text-xs">
                                    Tus pistas: {markerCanchas.map(id => getCanchaLabel(id)).join(', ')}
                                </span>
                            )}
                        </p>
                    </div>
                    <Link
                        href="/tournaments"
                        className="inline-flex items-center justify-center gap-2 w-full bg-padel-primary text-black py-4 rounded-2xl font-black uppercase italic tracking-tight hover:opacity-90 transition-opacity"
                    >
                        Ir a torneos
                    </Link>
                </div>
            </div>
        );
    }

    // ── Loading ────────────────────────────────────────────────────────────
    if (roleLoading || loadingCancha) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-10 h-10 text-padel-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/10 px-6 py-4">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-padel-primary/10 rounded-2xl flex items-center justify-center border border-padel-primary/20">
                            <Crosshair className="w-5 h-5 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="label-cancha">
                                Pista <span className="text-padel-primary">{canchaNum}</span>
                            </h1>
                            <p className="subtitle-page text-gray-600">
                                Control de Puntos
                            </p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-[10px] font-black uppercase tracking-widest ${isEnVivo ? 'bg-green-500/10 border-green-500/30 text-green-400' : 'bg-gray-800/50 border-white/10 text-gray-600'}`}>
                        {isEnVivo ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                        {isEnVivo ? 'EN VIVO' : 'EN ESPERA'}
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto px-6 pt-8 space-y-6">
                {/* ── ESTADO: ESPERA → Botón activar ── */}
                {!isEnVivo && (
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 space-y-4">
                                <h2 className="text-xs font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                                    <Shield className="w-4 h-4" /> Configurar Partido
                                </h2>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Equipo 1</label>
                                        <input
                                            type="text"
                                            value={equipo1.nombre}
                                            onChange={e => setEquipo1({ ...equipo1, nombre: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-bold text-sm outline-none focus:border-padel-primary/50 transition-colors"
                                            placeholder="Nombre Equipo 1"
                                        />
                                    </div>
                                    <div className="text-center text-gray-700 font-black text-xs uppercase tracking-widest">VS</div>
                                    <div>
                                        <label className="text-[9px] font-black uppercase text-gray-600 tracking-widest block mb-1">Equipo 2</label>
                                        <input
                                            type="text"
                                            value={equipo2.nombre}
                                            onChange={e => setEquipo2({ ...equipo2, nombre: e.target.value })}
                                            className="w-full bg-black border border-white/10 rounded-2xl px-5 py-3 text-white font-bold text-sm outline-none focus:border-padel-primary/50 transition-colors"
                                            placeholder="Nombre Equipo 2"
                                        />
                                    </div>
                                </div>
                            </div>

                            <motion.button
                                whileTap={{ scale: 0.97 }}
                                onClick={handleActivar}
                                disabled={activando}
                                className="w-full bg-padel-primary text-black py-5 rounded-3xl font-black uppercase italic tracking-tight text-base flex items-center justify-center gap-3 shadow-[0_20px_40px_rgba(204,255,0,0.25)] hover:shadow-[0_20px_60px_rgba(204,255,0,0.4)] transition-all disabled:opacity-50"
                            >
                                {activando ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                                INICIAR PARTIDO
                            </motion.button>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ── ESTADO: EN VIVO → Controles de marcador ── */}
                {isEnVivo && marcador && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-5"
                    >
                        {/* Equipos */}
                        <div className="grid grid-cols-2 gap-3">
                            {(['local', 'visitante'] as const).map((lado, i) => {
                                const equipo = i === 0 ? marcador.equipo_1 : marcador.equipo_2;
                                return (
                                    <div
                                        key={lado}
                                        className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center"
                                        style={{ borderColor: equipo?.color + '40' }}
                                    >
                                        <p className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-1">
                                            {lado === 'local' ? 'Equipo 1' : 'Equipo 2'}
                                        </p>
                                        <p className="font-black italic uppercase tracking-tight text-sm truncate"
                                            style={{ color: equipo?.color || '#fff' }}>
                                            {equipo?.nombre || `Equipo ${i + 1}`}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Sets */}
                        <ScoreRow
                            label="SETS"
                            localVal={marcador.sets.local}
                            visitanteVal={marcador.sets.visitante}
                            onUpLocal={() => cambiarSet('local', 1)}
                            onDownLocal={() => cambiarSet('local', -1)}
                            onUpVisitante={() => cambiarSet('visitante', 1)}
                            onDownVisitante={() => cambiarSet('visitante', -1)}
                            highlight
                        />

                        {/* Games */}
                        <ScoreRow
                            label="GAMES"
                            localVal={marcador.games.local}
                            visitanteVal={marcador.games.visitante}
                            onUpLocal={() => cambiarGame('local', 1)}
                            onDownLocal={() => cambiarGame('local', -1)}
                            onUpVisitante={() => cambiarGame('visitante', 1)}
                            onDownVisitante={() => cambiarGame('visitante', -1)}
                        />

                        {/* Puntos */}
                        <ScoreRow
                            label={`PUNTOS${marcador.modo_puntos === 'tiebreak' ? ' — TIEBREAK' : marcador.modo_puntos === 'super_tiebreak' ? ' — SUPER TB' : ''}`}
                            localVal={marcador.puntos.local}
                            visitanteVal={marcador.puntos.visitante}
                            onUpLocal={() => cambiarPunto('local', 1)}
                            onDownLocal={() => cambiarPunto('local', -1)}
                            onUpVisitante={() => cambiarPunto('visitante', 1)}
                            onDownVisitante={() => cambiarPunto('visitante', -1)}
                        />

                        {/* Modo de puntos: Tiebreak / Super Tiebreak */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setModoPuntos(
                                    canchaId,
                                    marcador.modo_puntos === 'tiebreak' ? 'normal' : 'tiebreak'
                                )}
                                className={`py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${marcador.modo_puntos === 'tiebreak'
                                    ? 'bg-orange-500/15 border-orange-500/50 text-orange-400'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-orange-500/30 hover:text-orange-400'
                                    }`}
                            >
                                <Trophy className="w-3.5 h-3.5" />
                                {marcador.modo_puntos === 'tiebreak' ? 'TB ACTIVO' : 'Tiebreak'}
                            </button>
                            <button
                                onClick={() => setModoPuntos(
                                    canchaId,
                                    marcador.modo_puntos === 'super_tiebreak' ? 'normal' : 'super_tiebreak'
                                )}
                                className={`py-3 rounded-2xl font-black uppercase italic tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all border-2 ${marcador.modo_puntos === 'super_tiebreak'
                                    ? 'bg-purple-500/15 border-purple-500/50 text-purple-400'
                                    : 'bg-white/5 border-white/10 text-gray-500 hover:border-purple-500/30 hover:text-purple-400'
                                    }`}
                            >
                                <Star className="w-3.5 h-3.5" />
                                {marcador.modo_puntos === 'super_tiebreak' ? 'SUPER TB ACTIVO' : 'Super TB'}
                            </button>
                        </div>

                        {/* Golden Point */}
                        <button
                            onClick={toggleGoldenPoint}
                            className={`w-full py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-3 transition-all border-2 ${marcador.golden_point
                                ? 'bg-yellow-400/10 border-yellow-400/50 text-yellow-400'
                                : 'bg-white/5 border-white/10 text-gray-500'
                                }`}
                        >
                            <Zap className="w-4 h-4" />
                            {marcador.golden_point ? 'PUNTO DE ORO ACTIVADO' : 'Activar Punto de Oro'}
                        </button>

                        {/* Terminar partido */}
                        <button
                            onClick={handleDesactivar}
                            className="w-full py-4 rounded-2xl font-black uppercase italic tracking-widest text-xs flex items-center justify-center gap-3 bg-red-500/10 border-2 border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                        >
                            <Square className="w-4 h-4" />
                            TERMINAR PARTIDO
                        </button>
                    </motion.div>
                )}
            </div>

            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
                .font-outfit { font-family: 'Outfit', sans-serif; }
            `}</style>
        </div>
    );
}

// ── Componente reutilizable de fila de puntaje ─────────────────────────────
function ScoreRow({
    label, localVal, visitanteVal,
    onUpLocal, onDownLocal, onUpVisitante, onDownVisitante,
    highlight = false,
}: {
    label: string;
    localVal: string | number;
    visitanteVal: string | number;
    onUpLocal: () => void;
    onDownLocal: () => void;
    onUpVisitante: () => void;
    onDownVisitante: () => void;
    highlight?: boolean;
}) {
    return (
        <div className={`rounded-3xl border p-5 ${highlight ? 'bg-padel-primary/5 border-padel-primary/20' : 'bg-white/5 border-white/10'}`}>
            <p className={`text-center text-[9px] font-black uppercase tracking-[0.4em] mb-4 ${highlight ? 'text-padel-primary' : 'text-gray-600'}`}>
                {label}
            </p>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                <TeamScoreControl
                    value={localVal}
                    onUp={onUpLocal}
                    onDown={onDownLocal}
                    highlight={highlight}
                />
                <span className="text-gray-700 font-black text-2xl">—</span>
                <TeamScoreControl
                    value={visitanteVal}
                    onUp={onUpVisitante}
                    onDown={onDownVisitante}
                    highlight={highlight}
                />
            </div>
        </div>
    );
}

function TeamScoreControl({
    value, onUp, onDown, highlight,
}: {
    value: string | number;
    onUp: () => void;
    onDown: () => void;
    highlight?: boolean;
}) {
    return (
        <div className="flex flex-col items-center gap-2">
            <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onUp}
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all active:scale-90 ${highlight ? 'bg-padel-primary/20 border-padel-primary/50 text-padel-primary hover:bg-padel-primary/30' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
            >
                <ChevronUp className="w-6 h-6" />
            </motion.button>
            <span className={`font-black text-3xl tracking-tighter min-w-[3rem] text-center ${highlight ? 'text-padel-primary' : 'text-white'}`}>
                {value}
            </span>
            <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={onDown}
                className="w-12 h-12 rounded-2xl flex items-center justify-center border-2 bg-white/5 border-white/10 text-gray-500 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all active:scale-90"
            >
                <ChevronDown className="w-6 h-6" />
            </motion.button>
        </div>
    );
}
