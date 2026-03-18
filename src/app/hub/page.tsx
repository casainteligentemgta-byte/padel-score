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
    const { user, profile, logout, loading: authLoading, isAdmin, profileLoading, refreshProfile } = useAuth();
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

    // Asegurar que el perfil esté cargado y tenga uniqueCode (generar si falta)
    useEffect(() => {
        if (!user?.uid || authLoading) return;
        if (profileLoading) return;
        if (!profile) {
            refreshProfile().catch(() => {});
            return;
        }
        if (!profile.uniqueCode) {
            refreshProfile().catch(() => {});
        }
    }, [user?.uid, authLoading, profileLoading, profile, profile?.uniqueCode, refreshProfile]);

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

    // Sin usuario: redirigir a login para que el hub solo muestre contenido con sesión
    if (!user) {
        router.replace('/login');
        return null;
    }

    const photoUrl = player?.photo ?? user?.photoURL ?? null;

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit relative overflow-hidden flex flex-col items-center">
            {/* Sidebar removed for minimalist view on Hub */}

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-padel-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center w-full flex-1 min-h-0 ipad-scroll-area">
                {/* Header: nombre, foto y código — compacto para caber en iPhone */}
                <header className="w-full max-w-md px-4 sm:px-6 pt-6 sm:pt-12 pb-2 sm:pb-4 flex items-center justify-center min-h-0">
                    <div className="flex flex-col items-center w-full">
                        {/* 1. HOLA, NOMBRE */}
                        <h1 className="text-lg sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white text-center mb-1 sm:mb-4">
                            HOLA, <span className="text-padel-primary">CRACK</span>
                        </h1>
                        {/* 2. Foto circular */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex justify-center mb-1 sm:mb-4"
                        >
                            <div className="relative w-16 h-16 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-brand/40 shadow-[0_0_24px_rgba(204,255,0,0.15)] ring-2 ring-black/20 bg-zinc-800">
                                {photoUrl ? (
                                    <img src={photoUrl} alt="" className="absolute inset-0 w-full h-full object-cover object-center" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <User className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 text-zinc-600" strokeWidth={1.5} />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        {/* 3. Código de 6 dígitos */}
                        <div className="mt-1 sm:mt-3 flex flex-col items-center gap-1 w-full">
                            <div className="flex items-center justify-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-full pl-4 pr-2 py-1.5 min-w-[160px]">
                                {profileLoading ? (
                                    <span className="text-sm text-white/60">Cargando código…</span>
                                ) : profile?.uniqueCode ? (
                                    <>
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
                                    </>
                                ) : (
                                    <>
                                        <span className="text-sm text-white/50 mr-1">Sin código</span>
                                        <button
                                            type="button"
                                            onClick={() => refreshProfile().catch(() => {})}
                                            className="text-xs font-bold text-padel-primary hover:underline"
                                        >
                                            Generar
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        {/* 4. Carta jugador (nombre, categoría, stats) debajo del saludo */}
                        {player && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 sm:mt-4 flex justify-center max-w-[260px] sm:max-w-[320px] mx-auto scale-[0.85] sm:scale-100 origin-top"
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
                    </div>
                </header>

                {/* Main Content — espaciado compacto para iPhone */}
                <main className="w-full max-w-md px-4 sm:px-6 flex-1 min-h-0">
                    <div className="w-full">
                        {/* Compañeros recientes: burbujas de avatar para inscribirse rápido con su código */}
                        {recentPartners.length > 0 && (
                            <div className="mb-3 sm:mb-6">
                                <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-white/50 mb-1 sm:mb-2">
                                    Inscribirse con un compañero
                                </p>
                                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                    {recentPartners.map((partner) => (
                                        <button
                                            key={partner.userId}
                                            type="button"
                                            onClick={() => router.push(`/tournaments?partnerCode=${encodeURIComponent(partner.uniqueCode || '')}&partnerName=${encodeURIComponent(partner.name)}`)}
                                            className="flex flex-col items-center gap-0.5 p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-white/10 bg-white/5 hover:border-padel-primary/50 hover:bg-padel-primary/10 transition-all"
                                            title={`Inscribirse con ${partner.name}`}
                                        >
                                            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-padel-primary/30 bg-zinc-800 flex items-center justify-center">
                                                {partner.photo ? (
                                                    <img src={partner.photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm sm:text-lg font-black text-padel-primary">
                                                        {(partner.name || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[7px] sm:text-[8px] font-bold text-white/80 truncate max-w-[48px] sm:max-w-[56px]">{partner.name?.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invitaciones pendientes: visible primero para el jugador invitado */}
                        <div className="mb-3 sm:mb-6">
                            <InvitationManager />
                        </div>

                        {/* Próximo Partido (prioritario si el usuario tiene partido hoy) */}
                        {nextMatch && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-3 sm:mb-6 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-padel-primary/30 bg-padel-primary/5 backdrop-blur-xl"
                            >
                                <p className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-padel-primary mb-2 sm:mb-3">
                                    <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Próximo Partido
                                </p>
                                <p className="text-[9px] sm:text-[10px] text-white/60 mb-1 sm:mb-2">{nextMatch.tournamentName}</p>
                                <div className="flex items-center justify-between gap-1.5 text-xs sm:text-sm font-bold text-white mb-2 sm:mb-3">
                                    <span className="truncate">{nextMatch.team1Name ?? 'TBD'}</span>
                                    <span className="text-padel-primary shrink-0">vs</span>
                                    <span className="truncate">{nextMatch.team2Name ?? 'TBD'}</span>
                                </div>
                                <div className="flex gap-1.5 sm:gap-2">
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/tournaments/${nextMatch.tournamentId}`)}
                                        className="flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-[9px] sm:text-[10px] font-bold uppercase text-white hover:bg-white/10 transition-colors"
                                    >
                                        Ver torneo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/tournaments/${nextMatch.tournamentId}/display/${nextMatch.matchId}`)}
                                        className="flex-1 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-padel-primary text-black text-[9px] sm:text-[10px] font-black uppercase hover:opacity-95 transition-opacity"
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
                                className="mb-3 sm:mb-6 p-3 sm:p-4 rounded-xl sm:rounded-2xl border-2 border-[#ccff00]/40 bg-[#ccff00]/5"
                            >
                                <p className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#ccff00] mb-1 sm:mb-2">¡Partido finalizado!</p>
                                <p className="text-[9px] sm:text-[10px] text-white/70 mb-2 sm:mb-3">Descarga tu tarjeta de victoria (1080×1080).</p>
                                <button
                                    type="button"
                                    onClick={handleDownloadVictoryCard}
                                    disabled={downloading}
                                    className="flex items-center justify-center gap-1.5 w-full py-2.5 sm:py-3 rounded-lg sm:rounded-xl bg-[#ccff00] text-black font-black text-[10px] sm:text-xs uppercase italic tracking-tight disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <>Generando imagen...</>
                                    ) : (
                                        <>
                                            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                            Descargar tarjeta de victoria
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Hub Grid - compacto en móvil para caber en una pantalla */}
                        <div className="grid grid-cols-2 gap-1 sm:gap-1.5 pb-4 sm:pb-8 max-w-[180px] sm:max-w-[200px] mx-auto mt-0 sm:mt-1">
                            {hubItems.map((item, index) => (
                                <motion.button
                                    key={item.name}
                                    type="button"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => {
                                        if (item.disabled) return;
                                        if (item.onClick) item.onClick();
                                        else if (item.href) router.push(item.href);
                                    }}
                                    className={`relative group w-full h-12 sm:h-16 rounded-[10px] sm:rounded-[14px] p-1 sm:p-1.5 flex flex-col items-center justify-center text-center transition-all overflow-hidden border backdrop-blur-xl box-border ${item.disabled
                                        ? 'bg-white/5 border-white/10 opacity-40 cursor-not-allowed'
                                        : `bg-white/5 ${item.border} border-white/10 hover:bg-white/10 hover:border-white/20 hover:-translate-y-0.5`
                                        }`}
                                >
                                    {/* Icon Container */}
                                    <div className={`shrink-0 p-0.5 sm:p-1 rounded-md sm:rounded-lg mb-0 mt-1 sm:mt-2 transition-all group-hover:scale-110 shadow-lg ${item.bg} ${item.color}`}>
                                        <item.icon className="w-2.5 h-2.5 sm:w-3 sm:h-3 block" />
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex flex-col gap-0 w-full items-center justify-center min-w-0 flex-1">
                                        <h3 className="text-[7px] sm:text-[8px] font-black uppercase italic tracking-tighter text-white group-hover:text-padel-primary transition-colors truncate w-full min-h-[0.75rem] sm:min-h-[1rem] flex items-center justify-center leading-tight">
                                            {item.name}
                                        </h3>
                                        <p className="text-[4px] sm:text-[5px] font-bold text-zinc-600 uppercase tracking-widest line-clamp-1 w-full text-center -mt-0.5">{item.subtitle}</p>
                                    </div>

                                    {!item.disabled && (
                                        <div className="absolute inset-0 bg-gradient-to-br from-padel-primary/0 to-padel-primary/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                                    )}
                                </motion.button>
                            ))}
                        </div>

                        {/* Logout Button */}
                        <div className="w-full flex justify-center items-center mt-2 sm:mt-4 mb-6 sm:mb-12">
                            <button
                                onClick={() => logout()}
                                className="flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-black text-[#FF2800] font-black uppercase italic tracking-[0.15em] sm:tracking-[0.2em] text-[9px] sm:text-[10px] hover:scale-105 transition-all border border-[#FF2800]/40"
                            >
                                <LogOut className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#FF2800]" />
                                FINALIZAR SESIÓN
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
