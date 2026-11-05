'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, ChevronLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { useRouter } from 'next/navigation';

type PlayerNotification = {
    id: string;
    type: string;
    message: string;
    isRead: boolean;
    createdAt: string | null;
};

function formatWhen(iso: string | null): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleString('es-VE', { dateStyle: 'medium', timeStyle: 'short' });
}

function typeLabel(type: string): string {
    if (type === 'payment_approved') return 'Pago aprobado';
    if (type === 'tournament_invite') return 'Invitación';
    return 'Aviso';
}

export default function NotificationsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [items, setItems] = useState<PlayerNotification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user?.uid) {
            router.replace('/login?next=/notifications');
        }
    }, [authLoading, router, user?.uid]);

    useEffect(() => {
        if (!user?.uid) return;
        let cancelled = false;
        (async () => {
            setLoading(true);
            const list = await dataService.getMyNotifications(user.uid);
            if (!cancelled) {
                setItems(list);
                setLoading(false);
            }
            const unread = (list || []).filter((n) => !n.isRead);
            await Promise.all(unread.map((n) => dataService.markNotificationRead(n.id)));
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.uid]);

    if (authLoading || !user) {
        return (
            <div className="min-h-dvh bg-black text-white flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-padel-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-[#000000] text-white pb-10">
            <main className="mx-auto max-w-md px-4 pt-6">
                <header className="mb-6 flex items-center gap-3">
                    <Link
                        href="/dashboard"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-[#121212]"
                        aria-label="Volver al dashboard"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </Link>
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-padel-primary">Smart Padel</p>
                        <h1 className="text-lg font-black italic uppercase tracking-tight">Avisos</h1>
                    </div>
                </header>

                {loading ? (
                    <p className="text-sm text-zinc-500">Cargando avisos...</p>
                ) : items.length === 0 ? (
                    <div className="rounded-2xl border border-white/10 bg-[#121212] p-6 text-center">
                        <Bell className="mx-auto mb-3 h-8 w-8 text-zinc-600" />
                        <p className="text-sm font-semibold text-zinc-300">No tienes avisos todavía.</p>
                        <p className="mt-1 text-xs text-zinc-500">
                            Aquí verás invitaciones de pareja y la aprobación de tus pagos.
                        </p>
                    </div>
                ) : (
                    <ul className="space-y-2.5">
                        {items.map((n) => (
                            <li
                                key={n.id}
                                className={`rounded-2xl border p-4 ${
                                    n.isRead
                                        ? 'border-white/10 bg-[#121212]'
                                        : 'border-padel-primary/30 bg-[#12160a]'
                                }`}
                            >
                                <p className="text-[10px] font-black uppercase tracking-widest text-padel-primary">
                                    {typeLabel(n.type)}
                                </p>
                                <p className="mt-1 text-sm font-semibold leading-snug text-white">{n.message}</p>
                                {n.createdAt ? (
                                    <p className="mt-2 text-[11px] text-zinc-500">{formatWhen(n.createdAt)}</p>
                                ) : null}
                            </li>
                        ))}
                    </ul>
                )}
            </main>
        </div>
    );
}
