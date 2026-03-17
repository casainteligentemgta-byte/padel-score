'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Trophy,
    User,
    Medal,
    LogOut,
    Wallet,
    Download,
    ImageIcon,
    Copy,
    Check,
    Clock
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { getAuthHeaders } from '@/lib/apiAuth';
import BouncingBall from '@/components/BouncingBall';
import InvitationManager from '@/components/InvitationManager';
import PlayerCard from '@/components/PlayerCard';

export default function HubPage() {
    const { user, profile, logout, loading: authLoading, isAdmin } = useAuth();
    const router = useRouter();
    const searchParams = useSearchParams();
    const tournamentId = searchParams.get('tournament_id');
    const matchId = searchParams.get('match_id');
    const [downloading, setDownloading] = useState(false);
    const [nextMatch, setNextMatch] = useState<{ tournamentId: string; matchId: string; scheduledTime?: string; team1Name?: string; team2Name?: string; tournamentName?: string } | null>(null);
    const [codeCopied, setCodeCopied] = useState(false);
    const [player, setPlayer] = useState<any | null>(null);
    const [playerStats, setPlayerStats] = useState<{ ranking?: string; titles?: number; played?: number; points?: number } | null>(null);
    const [recentPartners, setRecentPartners] = useState<{ userId: string; name: string; uniqueCode: string | null; photo: string | null }[]>([]);

    useEffect(() => {
        if (!authLoading && isAdmin) {
            router.replace('/admin');
        }
    }, [authLoading, isAdmin, router]);

    useEffect(() => {
        if (!user?.uid) return;
        dataService.getNextMatchForUser(user.uid).then(setNextMatch).catch(() => setNextMatch(null));
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) {
            setRecentPartners([]);
            return;
        }
        (async () => {
            try {
                const headers = await getAuthHeaders();
                const res = await fetch('/api/recent-partners', { headers });
                if (!res.ok) return;
                const json = await res.json();
                setRecentPartners(Array.isArray(json.partners) ? json.partners : []);
            } catch {
                setRecentPartners([]);
            }
        })();
    }, [user?.uid]);

    useEffect(() => {
        if (!user?.uid) {
            setPlayer(null);
            setPlayerStats(null);
            return;
        }
        dataService.getMyParticipants(user.uid).then((mine) => {
            const p = mine?.[0] ?? null;
            setPlayer(p);
            if (p?.id) {
                dataService.getPlayerStats(p.id).then((s) => {
                    setPlayerStats(s ? { ranking: s.ranking, played: s.played, titles: (s as any).won ?? 0, points: (s as any).points ?? 0 } : null);
                }).catch(() => setPlayerStats(null));
            } else {
                setPlayerStats(null);
            }
        }).catch(() => {
            setPlayer(null);
            setPlayerStats(null);
        });
    }, [user?.uid]);

    const handleCopyCode = async () => {
        if (!profile?.uniqueCode) return;
        try {
            await navigator.clipboard.writeText(profile.uniqueCode);
            setCodeCopied(true);
            setTimeout(() => setCodeCopied(false), 2000);
        } catch (_) {}
    };

    const handlePlayerClick = async () => {
        if (!user?.uid) {
            router.push('/login');
            return;
        }

        try {
            const mine = await dataService.getMyParticipants(user.uid);
            const player = mine?.[0];
            if (player?.id) {
                // Si ya tiene ficha, vamos a MI PERFIL
                router.push('/mi-cuenta');
            } else {
                // Si no tiene ficha, vamos al registro inicial
                router.push('/players/register');
            }
        } catch (e) {
            console.error('HubPage: error loading player profile', e);
            router.push('/mi-cuenta');
        }
    };

    const hubItems = [
        {
            name: 'Mi Perfil',
            subtitle: 'VER MI FICHA',
            icon: User,
            color: 'text-purple-400',
            bg: 'bg-purple-400/10',
            border: 'border-purple-400/10',
            onClick: handlePlayerClick
        },
        {
            name: 'Torneos',
            subtitle: 'EXPLORAR EVENTOS',
            icon: Trophy,
            color: 'text-padel-primary',
            bg: 'bg-padel-primary/10',
            border: 'border-padel-primary/10',
            href: '/tournaments'
        },
        {
            name: 'Ranking',
            subtitle: 'TABLA DE POSICIONES',
            icon: Medal,
            color: 'text-blue-400',
            bg: 'bg-blue-400/10',
            border: 'border-blue-400/10',
            href: '/ranking'
        },
        {
            name: 'Tarjeta de victoria',
            subtitle: 'DESCARGAR IMAGEN',
            icon: ImageIcon,
            color: 'text-amber-400',
            bg: 'bg-amber-400/10',
            border: 'border-amber-400/10',
            href: '/hub/victory-card'
        },
        {
            name: 'Wallet',
            subtitle: 'PRÓXIMAMENTE',
            icon: Wallet,
            color: 'text-emerald-400',
            bg: 'bg-emerald-400/10',
            border: 'border-emerald-400/10',
            disabled: true
        }
    ];

    const handleDownloadVictoryCard = async () => {
        if (!tournamentId || !matchId) return;
        setDownloading(true);
        try {
            const res = await fetch(`/api/generate-victory-card?match_id=${encodeURIComponent(matchId)}&tournament_id=${encodeURIComponent(tournamentId)}`);
            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err?.error || 'Error al generar la imagen');
            }
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `victoria-pro-${matchId}.png`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'No se pudo descargar la tarjeta');
        } finally {
            setDownloading(false);
        }
    };


    if (authLoading) {
        return (
            <div className="h-screen bg-[#080808] flex items-center justify-center">
                <BouncingBall size={32} bounceHeight={2} />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit relative overflow-hidden flex flex-col items-center">
            {/* Sidebar removed for minimalist view on Hub */}

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-padel-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full h-full">
                {/* Header */}
                <header className="w-full max-w-md px-6 pt-16 pb-8 flex items-center justify-center">
                    <div className="flex flex-col items-center">
                        <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">
                            HOLA, <span className="text-padel-primary">{profile?.name?.split(' ')[0] || 'CRACK'}</span>
                        </h1>
                        {profile?.uniqueCode && (
                            <div className="mt-2 flex flex-col items-center gap-1">
                                <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.3em]">Tu Código de Jugador (6 dígitos)</span>
                                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full pl-4 pr-2 py-1.5 mt-1">
                                    <span className="text-lg font-black text-white tracking-[0.25em] font-mono tabular-nums" aria-label={`Código ${profile.uniqueCode}`}>
                                        {profile.uniqueCode}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleCopyCode}
                                        className="p-2 rounded-full bg-padel-primary/20 text-padel-primary hover:bg-padel-primary/30 transition-colors"
                                        aria-label="Copiar código"
                                    >
                                        {codeCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </header>

                {/* Main Content */}
                <main className="w-full max-w-md px-6 flex-1">
                    <div className="w-full">
                        {/* Carta jugador tipo FIFA/Panini (destacada en Hub) */}
                        {player && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 flex justify-center"
                            >
                                <PlayerCard
                                    player={{
                                        id: player.id,
                                        name: player.name ?? '',
                                        lastName: player.lastName,
                                        photo: player.photo,
                                        level: player.level,
                                        position: player.position,
                                        category: player.category ?? (player.level != null ? `Nivel ${player.level}` : undefined),
                                    }}
                                    stats={playerStats ? { ranking: playerStats.ranking, titles: playerStats.titles ?? 0, played: playerStats.played ?? 0, points: playerStats.points ?? 0 } : undefined}
                                />
                            </motion.div>
                        )}

                        {/* Compañeros recientes: burbujas de avatar para inscribirse rápido con su código */}
                        {recentPartners.length > 0 && (
                            <div className="mb-6">
                                <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">
                                    Inscribirse con un compañero
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {recentPartners.map((partner) => (
                                        <button
                                            key={partner.userId}
                                            type="button"
                                            onClick={() => router.push(`/tournaments?partnerCode=${encodeURIComponent(partner.uniqueCode || '')}&partnerName=${encodeURIComponent(partner.name)}`)}
                                            className="flex flex-col items-center gap-1 p-1 rounded-xl border border-white/10 bg-white/5 hover:border-padel-primary/50 hover:bg-padel-primary/10 transition-all"
                                            title={`Inscribirse con ${partner.name}`}
                                        >
                                            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-padel-primary/30 bg-zinc-800 flex items-center justify-center">
                                                {partner.photo ? (
                                                    <img src={partner.photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-lg font-black text-padel-primary">
                                                        {(partner.name || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[8px] font-bold text-white/80 truncate max-w-[56px]">{partner.name?.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invitaciones pendientes: visible primero para el jugador invitado */}
                        <div className="mb-6">
                            <InvitationManager />
                        </div>

                        {/* Próximo Partido (prioritario si el usuario tiene partido hoy) */}
                        {nextMatch && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-5 rounded-2xl border border-padel-primary/30 bg-padel-primary/5 backdrop-blur-xl"
                            >
                                <p className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-padel-primary mb-3">
                                    <Clock className="w-4 h-4" /> Próximo Partido
                                </p>
                                <p className="text-[10px] text-white/60 mb-2">{nextMatch.tournamentName}</p>
                                <div className="flex items-center justify-between gap-2 text-sm font-bold text-white mb-3">
                                    <span className="truncate">{nextMatch.team1Name ?? 'TBD'}</span>
                                    <span className="text-padel-primary shrink-0">vs</span>
                                    <span className="truncate">{nextMatch.team2Name ?? 'TBD'}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/tournaments/${nextMatch.tournamentId}`)}
                                        className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[10px] font-bold uppercase text-white hover:bg-white/10 transition-colors"
                                    >
                                        Ver torneo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/tournaments/${nextMatch.tournamentId}/display/${nextMatch.matchId}`)}
                                        className="flex-1 py-2.5 rounded-xl bg-padel-primary text-black text-[10px] font-black uppercase hover:opacity-95 transition-opacity"
                                    >
                                        Ver pizarra
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Descargar tarjeta de victoria (al llegar desde partido finalizado) */}
                        {tournamentId && matchId && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-6 p-4 rounded-2xl border-2 border-[#ccff00]/40 bg-[#ccff00]/5"
                            >
                                <p className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-2">¡Partido finalizado!</p>
                                <p className="text-[10px] text-white/70 mb-3">Descarga tu tarjeta de victoria en alta calidad (1080×1080).</p>
                                <button
                                    type="button"
                                    onClick={handleDownloadVictoryCard}
                                    disabled={downloading}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#ccff00] text-black font-black text-xs uppercase italic tracking-tight disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <>Generando imagen...</>
                                    ) : (
                                        <>
                                            <Download className="w-4 h-4" />
                                            Descargar tarjeta de victoria
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Hub Grid */}
                        <div className="grid grid-cols-2 gap-3 pb-8">
                            {hubItems.map((item, index) => (
                                <motion.button
                                    key={item.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        if (item.disabled) return;
                                        if (item.onClick) item.onClick();
                                        else if (item.href) router.push(item.href);
                                    }}
                                    className={`relative group w-full h-32 rounded-[28px] p-4 flex flex-col items-center justify-center text-center transition-all overflow-hidden border backdrop-blur-xl ${item.disabled
                                        ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                                        : `bg-white/5 ${item.border} border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-1`
                                        }`}
                                >
                                    {/* Icon Container - Even Smaller */}
                                    <div className={`p-2 rounded-xl mb-2 transition-all group-hover:scale-110 shadow-lg ${item.bg} ${item.color}`}>
                                        <item.icon className="w-4 h-4" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex flex-col gap-0 w-full items-center">
                                        <h3 className="text-[10px] font-black uppercase italic tracking-tighter text-white group-hover:text-padel-primary transition-colors">
                                            {item.name}
                                        </h3>
                                        <p className="text-[6px] font-bold text-zinc-600 uppercase tracking-widest line-clamp-1">{item.subtitle}</p>
                                    </div>

                                    {/* Status Label */}
                                    {item.disabled && (
                                        <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-zinc-800 border border-white/10">
                                            <span className="text-[6px] font-black uppercase tracking-widest text-zinc-600 italic">Próximamente</span>
                                        </div>
                                    )}

                                    {/* Decorative Gradient Overlay */}
                                    {!item.disabled && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/0 to-padel-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Logout Button */}
                        <div className="flex justify-center mt-4 mb-12">
                            <button
                                onClick={() => logout()}
                                className="flex items-center gap-2 px-6 py-3 rounded-full bg-black text-[#FF2800] font-black uppercase italic tracking-[0.2em] text-[10px] hover:scale-105 transition-all border border-[#FF2800]/40"
                            >
                                <LogOut className="w-3.5 h-3.5 text-[#FF2800]" />
                                FINALIZAR SESIÓN
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
