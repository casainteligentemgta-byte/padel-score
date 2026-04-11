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
    Clock,
    Activity,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { getAuthHeaders } from '@/lib/apiAuth';
import BouncingBall from '@/components/BouncingBall';
import InvitationManager from '@/components/InvitationManager';
import PlayerCard from '@/components/PlayerCard';
import { buildPizarraConceptHref } from '@/app/tournaments/event/components/MatchCards';

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
    /** Hub móvil: carta y espaciados compactos para caber en 100dvh sin scroll de página. */
    const [hubCompactLayout, setHubCompactLayout] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(max-width: 639px)');
        const apply = () => setHubCompactLayout(mq.matches);
        apply();
        mq.addEventListener('change', apply);
        return () => mq.removeEventListener('change', apply);
    }, []);

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
                // Si ya tiene ficha, vamos al perfil del jugador
                router.push(`/players/${player.id}`);
            } else {
                // Si no tiene ficha, vamos al registro inicial
                router.push('/players/register');
            }
        } catch (e) {
            console.error('HubPage: error loading player profile', e);
            router.push('/players/register');
        }
    };

    const playerProfileHref = player?.id ? `/players/${player.id}` : '/players/register';

    /** Columna derecha: Torneos → Partidos → Ranking (debajo del botón Perfil). */
    const hubNavColumnItems = [
        {
            name: 'Torneos',
            subtitle: 'EXPLORAR EVENTOS',
            icon: Trophy,
            color: 'text-padel-primary',
            glow: 'shadow-padel-primary/20',
            bg: 'bg-padel-primary/15',
            border: 'border-padel-primary/40',
            hoverBorder: 'hover:border-padel-primary/70',
            href: '/tournaments',
        },
        {
            name: 'Partidos',
            subtitle: 'JUGADOS',
            icon: Activity,
            color: 'text-cyan-400',
            glow: 'shadow-cyan-400/20',
            bg: 'bg-cyan-400/15',
            border: 'border-cyan-400/40',
            hoverBorder: 'hover:border-cyan-400/70',
            href: playerProfileHref,
        },
        {
            name: 'Ranking',
            subtitle: 'GLOBAL',
            icon: Medal,
            color: 'text-sky-400',
            glow: 'shadow-sky-400/20',
            bg: 'bg-sky-400/15',
            border: 'border-sky-400/40',
            hoverBorder: 'hover:border-sky-400/70',
            href: '/ranking',
        },
    ] as const;

    const hubProfileItem = {
        name: 'Mi Perfil',
        subtitle: 'VER MI FICHA',
        icon: User,
        color: 'text-purple-400',
        glow: 'shadow-purple-400/20',
        bg: 'bg-purple-400/15',
        border: 'border-purple-400/40',
        hoverBorder: 'hover:border-purple-400/70',
        onClick: handlePlayerClick,
    };

    const hubBottomItems = [
        {
            name: 'Tarjeta de victoria',
            subtitle: 'DESCARGAR IMAGEN',
            icon: ImageIcon,
            color: 'text-amber-400',
            glow: 'shadow-amber-400/20',
            bg: 'bg-amber-400/15',
            border: 'border-amber-400/40',
            hoverBorder: 'hover:border-amber-400/70',
            href: '/hub/victory-card',
        },
        {
            name: 'Wallet',
            subtitle: 'PRÓXIMAMENTE',
            icon: Wallet,
            color: 'text-emerald-400',
            glow: 'shadow-emerald-400/20',
            bg: 'bg-emerald-400/15',
            border: 'border-emerald-400/40',
            hoverBorder: 'hover:border-emerald-400/40',
            disabled: true,
        },
    ];

    const HubProfileIcon = hubProfileItem.icon;

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
        <div
            className="relative flex w-full flex-1 flex-col items-stretch overflow-x-hidden bg-[#080808] font-outfit text-white max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:overflow-y-hidden max-sm:overscroll-none sm:min-h-0 sm:overflow-hidden
            pl-[max(0.375rem,env(safe-area-inset-left))] pr-[max(0.375rem,env(safe-area-inset-right))]
            pt-[max(0.25rem,env(safe-area-inset-top))] pb-[max(0.25rem,env(safe-area-inset-bottom))]
            sm:pl-4 sm:pr-4 sm:pt-4 sm:pb-4"
        >
            {/* Sidebar removed for minimalist view on Hub */}

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-padel-primary/5 rounded-full blur-[140px] -translate-y-1/2 translate-x-1/3 pointer-events-none" />
            <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-purple-500/5 rounded-full blur-[120px] -translate-x-1/3 pointer-events-none" />

            <div className="relative z-10 flex min-h-0 w-full min-w-0 flex-1 flex-col items-center overflow-hidden max-sm:h-full">
                {/* Header: nombre, foto y código — en móvil cabe en viewport sin scroll de página */}
                <header
                    className={`flex w-full max-w-md min-h-0 shrink-0 items-center justify-center px-2 sm:px-6 ${hubCompactLayout ? 'pt-0.5 pb-0' : 'pt-4 pb-2 sm:pt-10 sm:pb-4'}`}
                >
                    <div className="flex w-full flex-col items-center">
                        {/* 1. HOLA, NOMBRE */}
                        <h1
                            className={`font-black italic uppercase tracking-tighter text-white text-center ${hubCompactLayout ? 'mb-0 text-[clamp(0.8rem,3.8vw,1rem)] leading-none' : 'mb-1 text-lg sm:mb-4 sm:text-2xl md:text-3xl'}`}
                        >
                            HOLA, <span className="text-padel-primary">CRACK</span>
                        </h1>
                        {/* 2. Foto circular — compacta en móvil para dejar sitio a rejilla + cerrar sesión sin scroll */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`flex justify-center ${hubCompactLayout ? 'mb-1 mt-0.5' : 'mb-1 sm:mb-4'}`}
                        >
                            <div
                                className={`relative rounded-full overflow-hidden border-2 border-brand/40 shadow-[0_0_24px_rgba(204,255,0,0.15)] ring-2 ring-black/20 bg-zinc-800 ${hubCompactLayout ? 'h-10 w-10' : 'h-24 w-24 sm:h-44 sm:w-44 md:h-48 md:w-48'}`}
                            >
                                {photoUrl ? (
                                    <img src={photoUrl} alt="" className="absolute w-full h-full object-cover object-center" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <User
                                            className={`text-zinc-600 ${hubCompactLayout ? 'h-5 w-5' : 'h-8 w-8 sm:h-12 sm:w-12 md:h-14 md:w-14'}`}
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                        {/* 3. Código de 6 dígitos */}
                        <div
                            className={`flex w-full min-w-0 max-w-full flex-col items-center gap-0 px-1 ${hubCompactLayout ? 'mt-0.5' : 'mt-1 sm:mt-3 gap-1'}`}
                        >
                            <div
                                className={`flex w-full max-w-[min(100%,20rem)] items-center justify-center gap-1.5 rounded-2xl border border-white/10 bg-white/5 pl-2 pr-1.5 backdrop-blur-xl sm:min-w-[160px] sm:rounded-full ${hubCompactLayout ? 'py-0.5' : 'py-2 sm:py-1.5'}`}
                            >
                                {profileLoading ? (
                                    <span className="text-sm text-white/60">Cargando código…</span>
                                ) : profile?.uniqueCode ? (
                                    <>
                                        <span
                                            className={`min-w-0 max-w-full text-center font-black text-white font-mono tabular-nums sm:text-lg sm:tracking-[0.25em] ${hubCompactLayout ? 'text-[clamp(0.8rem,4vw,0.95rem)] tracking-[0.1em]' : 'text-[clamp(0.95rem,5vw,1.125rem)] tracking-[0.12em]'}`}
                                            aria-label={`Código ${profile.uniqueCode}`}
                                        >
                                            {profile.uniqueCode}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={handleCopyCode}
                                            className={`rounded-full bg-padel-primary/20 text-padel-primary transition-colors hover:bg-padel-primary/30 ${hubCompactLayout ? 'p-1' : 'p-2'}`}
                                            aria-label="Copiar código"
                                        >
                                            {codeCopied ? (
                                                <Check className={hubCompactLayout ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                                            ) : (
                                                <Copy className={hubCompactLayout ? 'h-3.5 w-3.5' : 'h-4 w-4'} />
                                            )}
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
                        {/* 4. Ficha: en móvil compacto solo una línea para reservar espacio a los 4 botones sin scroll */}
                        {player && hubCompactLayout && (
                            <p className="mt-1 max-w-full truncate px-1 text-center text-[9px] font-bold leading-tight text-white/85">
                                {[player.name, player.lastName].filter(Boolean).join(' ')}
                                {player.category || player.level != null ? (
                                    <span className="text-padel-primary/90">
                                        {' '}
                                        · {player.category ?? `Nivel ${player.level}`}
                                    </span>
                                ) : null}
                            </p>
                        )}
                        {player && !hubCompactLayout && (
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-2 w-full sm:mt-4"
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

                {/* Main — móvil: botones arriba; compañeros centrados; sin scroll de página */}
                <main className="flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden px-2 pb-0.5 sm:px-6 sm:pb-0">
                    <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden">
                        {/* Contenido central: en móvil va debajo de las rejillas (order-2); en sm+ arriba (order-1) */}
                        <div
                            className={`flex min-h-0 w-full min-w-0 flex-1 flex-col gap-0.5 overflow-x-hidden order-2 sm:order-1 ${hubCompactLayout ? 'overflow-y-hidden' : 'overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]'}`}
                        >
                        {/* Compañeros recientes: siempre centrados (1, 2, 3… en filas centradas) */}
                        {recentPartners.length > 0 && (
                            <div className={`shrink-0 ${hubCompactLayout ? 'mb-0' : 'mb-3 sm:mb-6'}`}>
                                <p
                                    className={`w-full text-center font-black uppercase tracking-widest text-white/50 ${hubCompactLayout ? 'mb-0.5 text-[8px]' : 'mb-1 text-[9px] sm:mb-2 sm:text-[10px]'}`}
                                >
                                    Inscribirse con un compañero
                                </p>
                                <div
                                    className={`flex flex-wrap justify-center gap-1.5 px-1 ${hubCompactLayout ? 'pb-0.5' : 'gap-1.5 sm:gap-2'}`}
                                >
                                    {recentPartners.map((partner) => (
                                        <button
                                            key={partner.userId}
                                            type="button"
                                            onClick={() => router.push(`/tournaments?partnerCode=${encodeURIComponent(partner.uniqueCode || '')}&partnerName=${encodeURIComponent(partner.name)}`)}
                                            className={`flex flex-col items-center rounded-lg border border-white/10 bg-white/5 transition-all hover:border-padel-primary/50 hover:bg-padel-primary/10 ${hubCompactLayout ? 'gap-0 p-0' : 'gap-0.5 p-0.5 sm:p-1 sm:rounded-xl'}`}
                                            title={`Inscribirse con ${partner.name}`}
                                        >
                                            <div
                                                className={`rounded-full overflow-hidden border border-padel-primary/30 bg-zinc-800 flex items-center justify-center ${hubCompactLayout ? 'h-5 w-5' : 'h-9 w-9 sm:h-12 sm:w-12'}`}
                                            >
                                                {partner.photo ? (
                                                    <img src={partner.photo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-sm sm:text-lg font-black text-padel-primary">
                                                        {(partner.name || '?').charAt(0).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                            <span
                                                className={`truncate font-bold text-white/80 ${hubCompactLayout ? 'hidden' : 'max-w-[48px] text-[7px] sm:max-w-[56px] sm:text-[8px]'}`}
                                            >
                                                {partner.name?.split(' ')[0]}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Invitaciones: móvil = franja + modal (sin scroll en hub) */}
                        <div className={`min-h-0 shrink-0 ${hubCompactLayout ? 'mb-0.5' : 'mb-3 sm:mb-6'}`}>
                            <InvitationManager compact={hubCompactLayout} singlePageStrip={hubCompactLayout} />
                        </div>

                        {/* Próximo Partido (prioritario si el usuario tiene partido hoy) */}
                        {nextMatch && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`min-h-0 shrink-0 rounded-xl border border-padel-primary/30 bg-padel-primary/5 backdrop-blur-xl sm:rounded-2xl ${hubCompactLayout ? 'mb-0.5 p-1' : 'mb-3 p-3 sm:mb-6 sm:p-5'}`}
                            >
                                <p
                                    className={`flex items-center gap-1 font-black uppercase tracking-widest text-padel-primary ${hubCompactLayout ? 'mb-0.5 text-[8px]' : 'mb-2 text-[10px] sm:mb-3 sm:text-xs'}`}
                                >
                                    <Clock className={hubCompactLayout ? 'h-2.5 w-2.5' : 'h-3.5 w-3.5 sm:h-4 sm:w-4'} /> Próximo Partido
                                </p>
                                <p className={`text-white/60 ${hubCompactLayout ? 'mb-0.5 line-clamp-1 text-[7px]' : 'mb-1 text-[9px] sm:mb-2 sm:text-[10px]'}`}>
                                    {nextMatch.tournamentName}
                                </p>
                                <div
                                    className={`flex items-center justify-between gap-1 font-bold text-white ${hubCompactLayout ? 'mb-0.5 text-[9px] leading-tight' : 'mb-2 text-xs sm:mb-3 sm:text-sm'}`}
                                >
                                    <span className="min-w-0 truncate">{nextMatch.team1Name ?? 'TBD'}</span>
                                    <span className="text-padel-primary shrink-0">vs</span>
                                    <span className="min-w-0 truncate">{nextMatch.team2Name ?? 'TBD'}</span>
                                </div>
                                <div className={`flex gap-1 ${hubCompactLayout ? '' : 'gap-1.5 sm:gap-2'}`}>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/tournaments/${nextMatch.tournamentId}`)}
                                        className={`flex-1 rounded-md border border-white/10 bg-white/5 font-bold uppercase text-white transition-colors hover:bg-white/10 ${hubCompactLayout ? 'py-1 text-[7px]' : 'py-2 text-[9px] sm:rounded-xl sm:py-2.5 sm:text-[10px]'}`}
                                    >
                                        Ver torneo
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            router.push(
                                                buildPizarraConceptHref(nextMatch.tournamentId, nextMatch.matchId),
                                            )
                                        }
                                        className={`flex-1 rounded-md bg-padel-primary font-black uppercase text-black transition-opacity hover:opacity-95 ${hubCompactLayout ? 'py-1 text-[7px]' : 'py-2 text-[9px] sm:rounded-xl sm:py-2.5 sm:text-[10px]'}`}
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
                                className={`min-h-0 shrink-0 rounded-xl border-2 border-[#ccff00]/40 bg-[#ccff00]/5 sm:rounded-2xl ${hubCompactLayout ? 'mb-0.5 p-1' : 'mb-3 p-3 sm:mb-6 sm:p-4'}`}
                            >
                                <p className={`font-black uppercase tracking-widest text-[#ccff00] ${hubCompactLayout ? 'mb-0.5 text-[8px]' : 'mb-1 text-[10px] sm:mb-2 sm:text-xs'}`}>
                                    ¡Partido finalizado!
                                </p>
                                <p className={`text-white/70 ${hubCompactLayout ? 'mb-1 line-clamp-1 text-[7px]' : 'mb-2 text-[9px] sm:mb-3 sm:text-[10px]'}`}>
                                    Descarga tu tarjeta de victoria (1080×1080).
                                </p>
                                <button
                                    type="button"
                                    onClick={handleDownloadVictoryCard}
                                    disabled={downloading}
                                    className={`flex w-full items-center justify-center gap-1 rounded-lg bg-[#ccff00] font-black uppercase italic tracking-tight text-black disabled:opacity-50 ${hubCompactLayout ? 'py-1.5 text-[8px]' : 'gap-1.5 py-2.5 text-[10px] sm:rounded-xl sm:py-3 sm:text-xs'}`}
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
                        </div>

                        {/* Perfil (1ª columna) + Torneos / Partidos / Ranking (2ª columna); luego tarjeta de victoria y wallet */}
                        <section
                            aria-label="Acciones del hub"
                            className={
                                hubCompactLayout
                                    ? 'order-1 flex w-full min-w-0 shrink-0 flex-col gap-1 pb-1'
                                    : 'order-2 mt-1 flex w-full min-w-0 shrink-0 flex-col gap-2 pb-4 mb-6 sm:mt-2 sm:gap-3 sm:pb-8 sm:mb-12'
                            }
                        >
                            <div
                                className={`grid w-full min-w-0 grid-cols-2 items-stretch ${hubCompactLayout ? 'gap-0.5' : 'gap-1.5 sm:gap-2'}`}
                            >
                                <motion.button
                                    type="button"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0 }}
                                    onClick={hubProfileItem.onClick}
                                    className={`relative group flex h-full min-h-0 w-full min-w-0 flex-col items-center justify-center border backdrop-blur-xl transition-all duration-200 active:scale-[0.97] shadow-md ${hubCompactLayout ? 'gap-0 rounded-lg border p-0.5' : 'gap-0.5 rounded-xl border-2 p-1.5 sm:p-2'} ${hubProfileItem.glow} bg-[#111] ${hubProfileItem.border} ${hubProfileItem.hoverBorder} hover:bg-[#181818]`}
                                >
                                    <div
                                        className={`rounded-md transition-transform group-hover:scale-110 ${hubProfileItem.bg} ${hubProfileItem.color} ${hubCompactLayout ? 'p-0.5' : 'p-1 sm:p-1.5'}`}
                                    >
                                        <HubProfileIcon
                                            className={hubCompactLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5'}
                                            strokeWidth={1.8}
                                        />
                                    </div>
                                    <div className="flex flex-col items-center gap-0 px-0.5">
                                        <h3
                                            className={`text-center font-black italic leading-tight tracking-tight text-white ${hubCompactLayout ? 'text-[8px] leading-tight' : 'text-[10px] sm:text-[12px]'}`}
                                        >
                                            {hubProfileItem.name}
                                        </h3>
                                        <p
                                            className={`text-center font-bold uppercase tracking-widest ${hubCompactLayout ? 'text-[5px]' : 'text-[6px] sm:text-[7px]'} ${hubProfileItem.color} opacity-70`}
                                        >
                                            {hubProfileItem.subtitle}
                                        </p>
                                    </div>
                                    <div
                                        className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${hubProfileItem.bg} ${hubCompactLayout ? 'rounded-lg' : 'rounded-xl'}`}
                                    />
                                </motion.button>
                                <div
                                    className={`flex min-h-0 min-w-0 flex-1 flex-col ${hubCompactLayout ? 'gap-0.5' : 'gap-1.5 sm:gap-2'}`}
                                >
                                    {hubNavColumnItems.map((item, index) => (
                                        <motion.button
                                            key={item.name}
                                            type="button"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.04 + index * 0.04 }}
                                            onClick={() => router.push(item.href)}
                                            className={`relative group flex min-h-0 flex-1 flex-col items-center justify-center border backdrop-blur-xl transition-all duration-200 active:scale-[0.97] shadow-md ${hubCompactLayout ? 'min-h-[2.65rem] gap-0 rounded-lg border p-0.5' : 'min-h-[56px] gap-0.5 rounded-xl border-2 p-1.5 sm:min-h-0 sm:flex-1 sm:p-2'} ${item.glow} bg-[#111] ${item.border} ${item.hoverBorder} hover:bg-[#181818]`}
                                        >
                                            <div
                                                className={`rounded-md transition-transform group-hover:scale-110 ${item.bg} ${item.color} ${hubCompactLayout ? 'p-0.5' : 'p-1 sm:p-1.5'}`}
                                            >
                                                <item.icon
                                                    className={hubCompactLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5'}
                                                    strokeWidth={1.8}
                                                />
                                            </div>
                                            <div className="flex flex-col items-center gap-0">
                                                <h3
                                                    className={`text-center font-black italic leading-tight tracking-tight text-white ${hubCompactLayout ? 'text-[8px] leading-tight' : 'text-[10px] sm:text-[12px]'}`}
                                                >
                                                    {item.name}
                                                </h3>
                                                <p
                                                    className={`text-center font-bold uppercase tracking-widest ${hubCompactLayout ? 'text-[5px]' : 'text-[6px] sm:text-[7px]'} ${item.color} opacity-70`}
                                                >
                                                    {item.subtitle}
                                                </p>
                                            </div>
                                            <div
                                                className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${item.bg} ${hubCompactLayout ? 'rounded-lg' : 'rounded-xl'}`}
                                            />
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                            <div className={`flex w-full flex-col ${hubCompactLayout ? 'gap-0.5' : 'gap-1.5 sm:gap-2'}`}>
                                {hubBottomItems.map((item, index) => (
                                    <motion.button
                                        key={item.name}
                                        type="button"
                                        initial={{ opacity: 0, y: 12 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.16 + index * 0.04 }}
                                        onClick={() => {
                                            if (item.disabled) return;
                                            if (item.href) router.push(item.href);
                                        }}
                                        className={`relative group flex w-full flex-col items-center justify-center border backdrop-blur-xl transition-all duration-200 active:scale-[0.97] shadow-md ${hubCompactLayout ? 'min-h-[2.65rem] gap-0 rounded-lg border p-0.5' : 'min-h-[56px] gap-0.5 rounded-xl border-2 p-1.5 sm:min-h-[72px] sm:p-2'} ${item.glow}
                                        ${
                                            item.disabled
                                                ? 'bg-white/3 border-white/10 opacity-40 cursor-not-allowed'
                                                : `bg-[#111] ${item.border} ${item.hoverBorder} hover:bg-[#181818]`
                                        }`}
                                    >
                                        <div
                                            className={`rounded-md transition-transform group-hover:scale-110 ${item.bg} ${item.color} ${hubCompactLayout ? 'p-0.5' : 'p-1 sm:p-1.5'}`}
                                        >
                                            <item.icon
                                                className={hubCompactLayout ? 'h-3 w-3' : 'h-4 w-4 sm:h-5 sm:w-5'}
                                                strokeWidth={1.8}
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-0">
                                            <h3
                                                className={`text-center font-black italic leading-tight tracking-tight text-white ${hubCompactLayout ? 'text-[8px] leading-tight' : 'text-[10px] sm:text-[12px]'}`}
                                            >
                                                {item.name}
                                            </h3>
                                            <p
                                                className={`text-center font-bold uppercase tracking-widest ${hubCompactLayout ? 'text-[5px]' : 'text-[6px] sm:text-[7px]'} ${item.disabled ? 'text-zinc-600' : item.color} opacity-70`}
                                            >
                                                {item.subtitle}
                                            </p>
                                        </div>
                                        {!item.disabled && (
                                            <div
                                                className={`absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none ${item.bg} ${hubCompactLayout ? 'rounded-lg' : 'rounded-xl'}`}
                                            />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </section>

                        {/* Cerrar sesión: siempre al pie en móvil (order-3) */}
                        <div
                            className={`order-3 flex w-full items-center justify-center shrink-0 pb-[max(0.35rem,env(safe-area-inset-bottom))] ${hubCompactLayout ? 'pt-0.5' : 'pb-4 sm:pb-8'}`}
                        >
                            <button
                                type="button"
                                onClick={() => logout()}
                                className={`flex items-center justify-center rounded-full border border-[#FF2800]/40 bg-black font-black uppercase italic text-[#FF2800] transition-all hover:scale-105 ${hubCompactLayout ? 'gap-0.5 px-2.5 py-1 text-[7px] tracking-[0.1em]' : 'gap-1.5 px-4 py-2.5 text-[9px] tracking-[0.15em] sm:gap-2 sm:px-6 sm:py-3 sm:text-[10px] sm:tracking-[0.2em]'}`}
                            >
                                <LogOut className={`text-[#FF2800] ${hubCompactLayout ? 'h-2.5 w-2.5' : 'h-3 w-3 sm:h-3.5 sm:w-3.5'}`} />
                                FINALIZAR SESIÓN
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
