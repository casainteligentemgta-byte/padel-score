'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { Home, Trophy, Medal, User, QrCode, X, Swords, TrendingUp, Flame } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { getSupabaseClient } from '@/lib/supabase/client';

type RecentMatch = {
    id: string;
    label: string;
    result: 'Victoria' | 'Derrota';
    dateText: string;
};

export default function DashboardPage() {
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [qrOpen, setQrOpen] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [category, setCategory] = useState('Sin categoría');
    const [avatar, setAvatar] = useState<string | null>(null);
    const [stats, setStats] = useState({
        totalMatches: 0,
        winRate: 0,
        streak: '0',
    });
    const [recentMatches, setRecentMatches] = useState<RecentMatch[]>([]);

    useEffect(() => {
        if (!authLoading && !user?.uid) {
            router.replace('/login');
        }
    }, [authLoading, router, user?.uid]);

    useEffect(() => {
        if (!user?.uid) return;
        let cancelled = false;

        (async () => {
            setLoadingData(true);
            try {
                const myParticipants = await dataService.getMyParticipants(user.uid);
                const participant = myParticipants?.[0];

                if (!cancelled) {
                    setCategory(participant?.category || (participant?.level != null ? `${participant.level}ta Categoría` : 'Sin categoría'));
                    setAvatar(participant?.photo || user.photoURL || null);
                }

                if (!participant?.id) {
                    if (!cancelled) {
                        setStats({ totalMatches: 0, winRate: 0, streak: '0' });
                        setRecentMatches([]);
                    }
                    return;
                }

                const playerStats = await dataService.getPlayerStats(participant.id);
                const total = Number(playerStats?.played ?? 0);
                const winRate = Number(String(playerStats?.effectiveness ?? '0').replace('%', '')) || 0;
                const streak = String(playerStats?.streak ?? '0');

                const supabase = getSupabaseClient();
                const { data: matchesRows } = supabase
                    ? await supabase
                          .from('tournament_matches')
                          .select('id,tournament_id,data,updated_at,created_at')
                          .order('updated_at', { ascending: false })
                          .limit(300)
                    : { data: [] as any[] };

                const parsedRecent: RecentMatch[] = (matchesRows || [])
                    .map((row: any) => {
                        const d = row?.data || {};
                        const isTeam1 =
                            d?.team1?.player1?.id === participant.id ||
                            d?.team1?.player2?.id === participant.id ||
                            d?.team1?.p1?.id === participant.id ||
                            d?.team1?.p2?.id === participant.id;
                        const isTeam2 =
                            d?.team2?.player1?.id === participant.id ||
                            d?.team2?.player2?.id === participant.id ||
                            d?.team2?.p1?.id === participant.id ||
                            d?.team2?.p2?.id === participant.id;
                        if (!isTeam1 && !isTeam2) return null;

                        const winner = Number(d?.winner ?? d?.winnerTeam ?? 0);
                        const won = (winner === 1 && isTeam1) || (winner === 2 && isTeam2);
                        if (winner !== 1 && winner !== 2) return null;

                        const tName = d?.tournamentName || d?.tournament_name || `Torneo ${String(row.tournament_id || '').slice(0, 8)}`;
                        const dateSource = row.updated_at || row.created_at || null;
                        const dateText = dateSource
                            ? new Date(dateSource).toLocaleDateString('es-VE', { day: '2-digit', month: 'short' })
                            : 'Sin fecha';

                        return {
                            id: String(row.id),
                            label: String(tName),
                            result: won ? 'Victoria' : 'Derrota',
                            dateText,
                        } as RecentMatch;
                    })
                    .filter(Boolean)
                    .slice(0, 3) as RecentMatch[];

                if (!cancelled) {
                    setStats({ totalMatches: total, winRate, streak });
                    setRecentMatches(parsedRecent);
                }
            } catch {
                if (!cancelled) {
                    setStats({ totalMatches: 0, winRate: 0, streak: '0' });
                    setRecentMatches([]);
                }
            } finally {
                if (!cancelled) setLoadingData(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [user?.uid, user?.photoURL]);

    if (authLoading || !user) {
        return (
            <div className="min-h-dvh bg-black text-white flex items-center justify-center">
                <p className="text-sm text-zinc-500">Cargando dashboard...</p>
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#000000] text-white pb-24">
            <main className="mx-auto max-w-md px-4 pt-6">
                <header className="mb-6 rounded-3xl border border-[#CCFF00]/20 bg-[#121212] p-4">
                    <div className="flex w-full flex-col items-center text-center">
                        <div className="mx-auto h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-[#CCFF00]/40 bg-zinc-900 shadow-[0_0_24px_rgba(204,255,0,0.12)]">
                            {avatar ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={avatar} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <div className="grid h-full w-full place-items-center text-sm text-zinc-500">SP</div>
                            )}
                        </div>
                        <h1
                            className="mt-4 w-full min-w-0 max-w-full truncate px-1 text-center text-lg font-black leading-tight tracking-tight text-white [font-size:clamp(0.75rem,3.2vw+0.35rem,1.125rem)]"
                            title={profile?.name || user.displayName || 'Jugador'}
                        >
                            {profile?.name || user.displayName || 'Jugador'}
                        </h1>
                        <span className="mt-3 inline-flex max-w-full rounded-full border border-[#CCFF00]/40 px-3 py-1.5 text-xs font-bold leading-snug text-[#CCFF00]">
                            {category}
                        </span>
                    </div>
                </header>

                <button
                    type="button"
                    onClick={() => setQrOpen(true)}
                    className="mb-5 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#CCFF00] bg-[#CCFF00] px-4 py-3 font-black text-black"
                >
                    <QrCode className="h-4 w-4" />
                    QR Quick Access
                </button>

                <section className="mb-6 grid grid-cols-3 gap-2.5">
                    <StatCard icon={<Swords className="h-4 w-4" />} label="Partidos" value={loadingData ? '...' : String(stats.totalMatches)} />
                    <StatCard icon={<TrendingUp className="h-4 w-4" />} label="Victorias" value={loadingData ? '...' : `${stats.winRate}%`} />
                    <StatCard icon={<Flame className="h-4 w-4" />} label="Racha" value={loadingData ? '...' : stats.streak} />
                </section>

                <section className="rounded-3xl border border-white/10 bg-[#121212] p-4">
                    <h2 className="mb-3 text-sm font-black uppercase tracking-wider text-[#CCFF00]">
                        Actividad Reciente
                    </h2>
                    <div className="space-y-2.5">
                        {recentMatches.length === 0 ? (
                            <p className="text-sm text-zinc-500">Aún no hay partidos recientes.</p>
                        ) : (
                            recentMatches.map((m) => (
                                <div key={m.id} className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-3 py-2.5">
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-bold">{m.label}</p>
                                        <p className="text-xs text-zinc-500">{m.dateText}</p>
                                    </div>
                                    <span
                                        className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                                            m.result === 'Victoria'
                                                ? 'bg-emerald-500/20 text-emerald-300'
                                                : 'bg-red-500/20 text-red-300'
                                        }`}
                                    >
                                        {m.result}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </main>

            <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0B0B0B]/95 backdrop-blur">
                <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
                    <NavItem icon={<Home className="h-5 w-5" />} label="Inicio" active onClick={() => router.push('/dashboard')} />
                    <NavItem icon={<Trophy className="h-5 w-5" />} label="Torneos" onClick={() => router.push('/tournaments')} />
                    <NavItem icon={<Medal className="h-5 w-5" />} label="Ranking" onClick={() => router.push('/ranking')} />
                    <NavItem icon={<User className="h-5 w-5" />} label="Perfil" onClick={() => router.push('/mi-cuenta')} />
                </div>
            </nav>

            {qrOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4">
                    <div className="w-full max-w-sm rounded-3xl border border-[#CCFF00]/30 bg-[#121212] p-5">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-sm font-black uppercase tracking-widest text-[#CCFF00]">Tu QR Único</h3>
                            <button onClick={() => setQrOpen(false)} className="rounded-lg border border-white/10 p-1.5">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="flex justify-center rounded-2xl bg-black p-4">
                            <QRCodeSVG
                                value={`smartpadel:player:${user.uid}`}
                                size={220}
                                bgColor="#000000"
                                fgColor="#CCFF00"
                                level="M"
                                includeMargin={false}
                            />
                        </div>
                        <p className="mt-3 text-center text-xs text-zinc-500">ID: {user.uid.slice(0, 10)}...</p>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
    return (
        <article className="rounded-2xl border border-white/10 bg-[#121212] p-3">
            <div className="mb-1 text-[#CCFF00]">{icon}</div>
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
            <p className="text-2xl font-black leading-none">{value}</p>
        </article>
    );
}

function NavItem({
    icon,
    label,
    active = false,
    onClick,
}: {
    icon: ReactNode;
    label: string;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 rounded-xl py-2 text-xs ${
                active ? 'text-[#CCFF00]' : 'text-zinc-400'
            }`}
        >
            {icon}
            <span className="font-bold">{label}</span>
        </button>
    );
}

