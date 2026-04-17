'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import {
    User,
    Shield,
    RefreshCw,
    Edit3,
    Phone,
    Instagram,
    Shirt,
    HeartPulse,
    Copy,
    Check,
    Users,
    LogOut,
    ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BouncingBall } from '@/components/BouncingBall';
import LoginButton from '@/components/LoginButton';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/formatters';

/** Tipografía y contenedores unificados (Mi cuenta) */
const T = {
    pageTitle: 'text-xl font-black italic uppercase tracking-tighter text-white sm:text-2xl',
    pageSubtitle: 'mt-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500',
    section: 'text-[11px] font-black uppercase tracking-[0.2em] text-[#ccff00]',
    subsectionLabel: 'text-[10px] font-bold uppercase tracking-widest text-zinc-500',
    body: 'text-sm leading-relaxed text-zinc-300',
    bodySmall: 'text-xs leading-relaxed text-zinc-400',
    card: 'rounded-2xl border border-white/10 bg-[#111] sm:rounded-3xl',
    btnStack: 'flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap',
    btnPrimary:
        'inline-flex min-h-[48px] w-full flex-1 items-center justify-center rounded-2xl bg-[#ccff00] px-4 py-3 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-[#ccff00]/90 active:scale-[0.98] disabled:opacity-50 sm:min-h-0',
    btnGhost:
        'inline-flex min-h-[48px] w-full items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-red-400 transition-all hover:bg-red-500/10 active:scale-[0.98] disabled:opacity-50 sm:min-h-0 sm:w-auto sm:min-w-[7rem]',
    fichaNameOneLine:
        'block w-full min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-justify font-black uppercase tracking-wide text-white [font-size:clamp(0.65rem,2.5vw+0.35rem,1.125rem)] [text-align-last:center] leading-none sm:text-left sm:[text-align-last:auto]',
} as const;

export default function MiCuentaPage() {
    const { user, loading: authLoading, logout } = useAuth();
    const router = useRouter();
    const [error, setError] = useState('');
    const [player, setPlayer] = useState<any | null>(null);
    const [loadingPlayer, setLoadingPlayer] = useState(true);
    const [copied, setCopied] = useState(false);
    const [invitations, setInvitations] = useState<any[]>([]);
    const [loadingInvs, setLoadingInvs] = useState(true);
    const [respondingId, setRespondingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) router.replace('/login');
    }, [user, authLoading, router]);

    // Cargar ficha de jugador asociada a este usuario (participants.ownerId = uid)
    useEffect(() => {
        const load = async () => {
            if (!user?.uid) {
                setPlayer(null);
                setLoadingPlayer(false);
                return;
            }
            try {
                const mine = await dataService.getMyParticipants(user.uid);
                const p = mine[0] || null;
                setPlayer(p);
            } catch {
                setPlayer(null);
            } finally {
                setLoadingPlayer(false);
            }
        };
        if (!authLoading && user) load();
    }, [authLoading, user]);

    // Cargar invitaciones del Jugador B
    useEffect(() => {
        const loadInvs = async () => {
            if (!user?.uid) return;
            try {
                const list = await dataService.getMyInvitations(user.uid);
                setInvitations(list);
            } catch (err) {
                console.error("Error loading invitations:", err);
            } finally {
                setLoadingInvs(false);
            }
        };
        if (!authLoading && user) loadInvs();
    }, [authLoading, user]);

    // Suscripción Realtime para invitaciones
    useEffect(() => {
        if (!user?.uid) return;
        const supabase = getSupabaseClient();
        if (!supabase) return;

        const channel = supabase
            .channel('invitations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'teams',
                    filter: `player_b_id=eq.${user.uid}`
                },
                () => {
                    // Recargar invitaciones al haber cambios
                    dataService.getMyInvitations(user.uid).then(setInvitations);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.uid]);

    const handleInvitationResponse = async (id: string, status: 'accepted' | 'rejected') => {
        setRespondingId(id);
        setError('');
        try {
            await dataService.respondToInvitation(id, status);
            // Refrescar lista
            const list = await dataService.getMyInvitations(user!.uid);
            setInvitations(list);
            if (status === 'accepted') {
                // Si aceptó, tal vez redirigir o mostrar éxito
                alert('¡Invitación aceptada con éxito! Ya estás inscrito.');
            }
        } catch (err: any) {
            setError(err.message || 'Error al procesar la invitación.');
        } finally {
            setRespondingId(null);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-6 text-center">
                <User className="w-20 h-20 text-padel-primary/20 mb-8" />
                <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Inicia Sesión</h1>
                <p className="text-gray-500 max-w-md mb-8">Inicia sesión para ver tus datos.</p>
                <LoginButton />
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative overflow-x-hidden">
            <div className="flex min-w-0 flex-shrink-0 items-center gap-3 px-[max(1rem,env(safe-area-inset-left,0px))] pb-2 pt-[max(0.75rem,env(safe-area-inset-top,0px))] pr-[max(1rem,env(safe-area-inset-right,0px))] md:pl-10">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-10 w-10 flex-shrink-0 touch-manipulation items-center justify-center rounded-full bg-white/5 transition-colors hover:bg-white/10"
                    aria-label="Volver"
                >
                    <ChevronLeft className="h-4 w-4 text-zinc-300" />
                </button>
                <BouncingBall size={22} />
                <div className="min-w-0 flex-1">
                    <h1 className={`${T.pageTitle} truncate`}>Mi perfil</h1>
                    <p className={T.pageSubtitle}>Ficha de jugador</p>
                </div>
            </div>
            <main className="ipad-scroll-area min-h-0 w-full min-w-0 flex-1 px-[max(1rem,env(safe-area-inset-left,0px))] pb-[max(5.5rem,env(safe-area-inset-bottom,28px))] pr-[max(1rem,env(safe-area-inset-right,0px))] md:pl-24 md:pr-6">
                <div className="mx-auto min-w-0 w-full max-w-2xl space-y-8">
                    {/* SECCIÓN DE INVITACIONES PENDIENTES */}
                    {!loadingInvs && invitations.length > 0 && (
                        <section className="min-w-0 space-y-4" aria-labelledby="invitaciones-heading">
                            <h2 id="invitaciones-heading" className={`${T.section} flex items-center gap-2`}>
                                <Users className="h-3.5 w-3.5 shrink-0" aria-hidden /> Invitaciones pendientes
                            </h2>
                            {error && (
                                <div className="rounded-2xl border border-red-500/25 bg-red-500/10 p-4 text-xs font-semibold text-red-400">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-4">
                                {invitations.map((inv) => (
                                    <div
                                        key={inv.id}
                                        className={`${T.card} relative overflow-hidden border-[#ccff00]/25 p-5 shadow-xl sm:p-6`}
                                    >
                                        <div className="absolute right-0 top-0 p-3">
                                            <span className="rounded-full bg-[#ccff00]/10 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-[#ccff00]">
                                                Reserva activa
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-4 pr-14 sm:pr-0">
                                            <div className="space-y-2">
                                                <p className={`${T.subsectionLabel} text-zinc-500`}>{inv.tournament_name || 'Torneo'}</p>
                                                <h3 className="text-base font-black uppercase italic tracking-tight text-white sm:text-lg">
                                                    Invitación de {inv.inviter_name}
                                                </h3>
                                                <p className={`${T.body} font-semibold text-padel-primary`}>Categoría: {inv.category}</p>
                                            </div>

                                            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                                <p className={`${T.subsectionLabel} mb-2 text-zinc-500`}>Nota importante</p>
                                                <p className={T.body}>
                                                    ¡Tienes un lugar reservado! Acepta antes de que expire el tiempo para asegurar tu participación.
                                                </p>
                                            </div>

                                            <div className={`${T.btnStack} pt-1`}>
                                                <button
                                                    type="button"
                                                    onClick={() => handleInvitationResponse(inv.id, 'accepted')}
                                                    disabled={respondingId === inv.id}
                                                    className={T.btnPrimary}
                                                >
                                                    {respondingId === inv.id ? 'Procesando…' : 'Aceptar inscripción'}
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleInvitationResponse(inv.id, 'rejected')}
                                                    disabled={respondingId === inv.id}
                                                    className={T.btnGhost}
                                                >
                                                    Rechazar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Ficha de jugador (si existe en participants) */}
                    {!loadingPlayer && player && (
                        <section className={`${T.card} min-w-0 overflow-hidden shadow-xl`} aria-labelledby="ficha-heading">
                            <div className="space-y-6 p-5 sm:p-6 md:p-8">
                                <h2 id="ficha-heading" className={`${T.section}`}>
                                    Ficha de jugador
                                </h2>

                                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-6">
                                    <div className="flex min-w-0 gap-4">
                                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/5 sm:h-24 sm:w-24">
                                            {player.photo ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img src={player.photo} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <User className="h-8 w-8 text-zinc-600 sm:h-9 sm:w-9" />
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <p className={`${T.fichaNameOneLine} sm:text-lg`}>{player.name} {player.lastName}</p>
                                            {player?.uniqueCode && (
                                                <button
                                                    type="button"
                                                    onClick={async () => {
                                                        try {
                                                            await navigator.clipboard.writeText(String(player.uniqueCode));
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 1600);
                                                        } catch {
                                                            setError('No se pudo copiar el código.');
                                                        }
                                                    }}
                                                    className="inline-flex max-w-full touch-manipulation items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left transition-all hover:border-padel-primary/40 hover:text-white"
                                                    title="Copiar código"
                                                >
                                                    <span className={`${T.subsectionLabel} shrink-0 text-zinc-500`}>Código</span>
                                                    <span className="font-mono text-sm font-black tracking-[0.2em] text-white">{player.uniqueCode}</span>
                                                    {copied ? <Check className="h-4 w-4 shrink-0 text-padel-primary" /> : <Copy className="h-4 w-4 shrink-0 text-zinc-500" />}
                                                </button>
                                            )}
                                            <p className={`${T.subsectionLabel} flex flex-wrap items-center gap-x-2 gap-y-0.5`}>
                                                <span>Posición</span>
                                                <span className="font-semibold text-padel-primary">{player.position || 'Drive / Revés'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto lg:flex-col lg:items-stretch">
                                        <span className="inline-flex w-fit items-center rounded-full bg-padel-primary/10 px-3 py-1.5 text-[11px] font-black uppercase tracking-widest text-padel-primary">
                                            Nivel {player.level ?? 4}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => router.push(`/players/register?edit=${player.id}`)}
                                            className="inline-flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-black uppercase tracking-widest text-zinc-200 transition-all hover:border-padel-primary/50 hover:bg-padel-primary hover:text-black sm:min-h-0 lg:w-full"
                                        >
                                            <Edit3 className="h-4 w-4 shrink-0" />
                                            Modificar ficha
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-6">
                                    <div className="min-w-0 space-y-2">
                                        <p className={`${T.subsectionLabel} flex items-center gap-2`}>
                                            <Shield className="h-3.5 w-3.5 shrink-0" aria-hidden /> Identificación
                                        </p>
                                        <div className={`${T.body} space-y-1.5 break-words`}>
                                            <p>
                                                <span className="font-semibold text-white">Cédula:</span>{' '}
                                                <span className="text-zinc-300">{player.dni || '—'}</span>
                                            </p>
                                            <p>
                                                <span className="font-semibold text-white">Fecha nac.:</span>{' '}
                                                <span className="text-zinc-300">{formatDate(player.birthDate)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <p className={`${T.subsectionLabel} flex items-center gap-2`}>
                                            <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden /> Contacto
                                        </p>
                                        <div className={`${T.body} space-y-1.5 break-words`}>
                                            <p>
                                                <span className="font-semibold text-white">WhatsApp:</span>{' '}
                                                <span className="text-zinc-300">{player.phone || '—'}</span>
                                            </p>
                                            <p className="flex min-w-0 items-start gap-2">
                                                <Instagram className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-500" aria-hidden />
                                                <span className="min-w-0">
                                                    <span className="font-semibold text-white">IG:</span>{' '}
                                                    <span className="text-zinc-300">
                                                        {player.instagram ? `@${String(player.instagram).replace('@', '')}` : 'No vinculado'}
                                                    </span>
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <p className={`${T.subsectionLabel} flex items-center gap-2`}>
                                            <Shirt className="h-3.5 w-3.5 shrink-0" aria-hidden /> Tallas
                                        </p>
                                        <div className={`${T.body} space-y-1.5 break-words`}>
                                            <p>
                                                <span className="font-semibold text-white">Franela:</span>{' '}
                                                <span className="text-zinc-300">{player.suitSize || '—'}</span>
                                            </p>
                                            <p>
                                                <span className="font-semibold text-white">Short:</span>{' '}
                                                <span className="text-zinc-300">{player.shortSize || '—'}</span>
                                            </p>
                                            <p>
                                                <span className="font-semibold text-white">Calzado:</span>{' '}
                                                <span className="text-zinc-300">{player.shoeSize || '—'}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="min-w-0 space-y-2">
                                        <p className={`${T.subsectionLabel} flex items-center gap-2`}>
                                            <HeartPulse className="h-3.5 w-3.5 shrink-0" aria-hidden /> Salud
                                        </p>
                                        <div className={`${T.body} space-y-1.5 break-words`}>
                                            <p>
                                                <span className="font-semibold text-white">Sangre:</span>{' '}
                                                <span className="text-zinc-300">{player.bloodType || '—'}</span>
                                            </p>
                                            <p>
                                                <span className="font-semibold text-white">Alergias:</span>{' '}
                                                <span className="text-zinc-300">{player.allergies || 'Ninguna'}</span>
                                            </p>
                                            <p>
                                                <span className="font-semibold text-white">Cond. médicas:</span>{' '}
                                                <span className="text-zinc-300">{player.medicalConditions || 'Ninguna'}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Si no hay ficha aún, sugerir registro */}
                    {!loadingPlayer && !player && (
                        <section
                            className={`${T.card} border-dashed border-white/20 p-6 text-center sm:p-8`}
                            aria-labelledby="sin-ficha-heading"
                        >
                            <h2 id="sin-ficha-heading" className={T.section}>
                                Ficha de jugador
                            </h2>
                            <p className={`${T.body} mx-auto mt-4 max-w-md font-medium text-zinc-200`}>
                                Aún no has creado tu ficha de jugador.
                            </p>
                            <p className={`${T.bodySmall} mx-auto mt-2 max-w-md`}>
                                Completa tu perfil deportivo con tallas, tipo de sangre y datos de contacto para agilizar inscripciones y emergencias médicas.
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push('/players/register')}
                                className="mt-6 inline-flex min-h-[48px] w-full max-w-sm touch-manipulation items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-black transition-all hover:bg-zinc-200 active:scale-[0.98]"
                            >
                                Crear ficha de jugador
                            </button>
                        </section>
                    )}
                </div>

                <div className="mx-auto mt-2 w-full max-w-2xl min-w-0 px-0">
                    <button
                        type="button"
                        onClick={async () => {
                            await logout();
                            router.replace('/login');
                        }}
                        className="flex w-full min-h-[52px] touch-manipulation items-center justify-center gap-2 rounded-2xl border border-red-500/25 bg-red-500/10 py-3.5 text-sm font-black uppercase italic tracking-widest text-red-400 transition-all hover:bg-red-500/20 active:scale-[0.98]"
                    >
                        <LogOut className="h-4 w-4 shrink-0" aria-hidden />
                        Finalizar sesión
                    </button>
                </div>
            </main>
        </div>
    );
}
