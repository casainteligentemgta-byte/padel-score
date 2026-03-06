'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, CheckCircle2, FileText, Loader2, AlertCircle } from 'lucide-react';

/** Categorías de inscripción que el organizador puede configurar en el torneo (tournament.inscriptionCategories). */
export type InscriptionCategoryOption = {
    key: string;
    name: string;
    price: number;
    gender?: 'MALE' | 'FEMALE' | 'MIXED';
};

export default function InscribirmePage({ params }: { params: Promise<{ id: string }> }) {
    const { id: tournamentId } = use(params);
    const router = useRouter();
    const { user, profile, loading: authLoading } = useAuth();
    const [tournament, setTournament] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
    const [acceptTerms, setAcceptTerms] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!tournamentId || authLoading) return;
        let cancelled = false;
        dataService.getTournament(tournamentId).then((t) => {
            if (!cancelled) {
                setTournament(t);
                setLoading(false);
            }
        }).catch(() => {
            if (!cancelled) {
                setLoading(false);
                setError('No se pudo cargar el torneo.');
            }
        });
        return () => { cancelled = true; };
    }, [tournamentId, authLoading]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?from=inscribirme');
        }
    }, [user, authLoading, router]);

    const categories: InscriptionCategoryOption[] = Array.isArray(tournament?.inscriptionCategories)
        ? tournament.inscriptionCategories
        : [];

    const toggleCategory = (key: string) => {
        setSelectedCategories((prev) => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const handleSubmit = async () => {
        if (!user?.uid || !tournament) return;
        if (selectedCategories.size === 0) {
            setError('Selecciona al menos una categoría.');
            return;
        }
        if (!acceptTerms) {
            setError('Debes aceptar los términos de inscripción.');
            return;
        }

        setError(null);
        setSubmitting(true);
        try {
            const participantName = profile?.name || user.displayName || user.email || 'Jugador';
            const participantEmail = user.email || undefined;
            const myParticipants = await dataService.getMyParticipants(user.uid);
            const participantId = myParticipants?.[0]?.id ?? undefined;

            for (const key of selectedCategories) {
                const cat = categories.find((c) => c.key === key);
                if (!cat) continue;
                await dataService.addInscription(
                    {
                        tournamentId,
                        tournamentName: tournament.name,
                        categoryKey: cat.key,
                        categoryPrice: cat.price,
                        participantName,
                        participantEmail,
                        participantId,
                        paymentStatus: 'pending',
                    },
                    user.uid
                );
            }
            setSuccess(true);
        } catch (e: any) {
            setError(e?.message || 'Error al registrar la inscripción.');
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="ipad-screen-container bg-[#0a0a0a] text-white flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />
            <div className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-24">
                <header className="sticky top-0 z-50 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10 py-4">
                    <div className="max-w-md mx-auto px-4 flex items-center justify-between">
                        <Link
                            href={`/tournaments/${tournamentId}`}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-black italic uppercase tracking-tighter">Inscribirme</h1>
                        <div className="w-10" />
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-8">
                    {success ? (
                        <div className="rounded-3xl bg-[#ccff00]/10 border border-[#ccff00]/30 p-8 text-center space-y-4">
                            <CheckCircle2 className="w-16 h-16 text-[#ccff00] mx-auto" />
                            <h2 className="text-xl font-black uppercase">Inscripción enviada</h2>
                            <p className="text-sm text-gray-400">
                                Te has inscrito en {selectedCategories.size} categoría(s). El organizador validará el pago si aplica.
                            </p>
                            <Link
                                href={`/tournaments/${tournamentId}`}
                                className="inline-block px-6 py-3 bg-[#ccff00] text-black font-black rounded-2xl uppercase text-sm"
                            >
                                Volver al torneo
                            </Link>
                        </div>
                    ) : (
                        <>
                            {tournament && (
                                <p className="text-sm text-gray-500 mb-6">
                                    {tournament.name}
                                </p>
                            )}

                            {categories.length === 0 ? (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        Este torneo no tiene categorías de inscripción configuradas. Contacta al organizador.
                                    </p>
                                    <Link href={`/tournaments/${tournamentId}`} className="mt-4 inline-block text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <section className="mb-8">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-4">
                                            Elige una o varias categorías
                                        </h2>
                                        <p className="text-[10px] text-gray-500 mb-4">
                                            Puedes inscribirte en varias. El horario se generará evitando que tengas partidos a la misma hora en distintas categorías.
                                        </p>
                                        <div className="space-y-3">
                                            {categories.map((cat) => (
                                                <label
                                                    key={cat.key}
                                                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
                                                        selectedCategories.has(cat.key)
                                                            ? 'bg-[#ccff00]/10 border-[#ccff00]/40'
                                                            : 'bg-white/5 border-white/10 hover:border-white/20'
                                                    }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedCategories.has(cat.key)}
                                                            onChange={() => toggleCategory(cat.key)}
                                                            className="w-5 h-5 rounded border-2 border-[#ccff00] text-[#ccff00] focus:ring-[#ccff00]"
                                                        />
                                                        <span className="font-bold">{cat.name}</span>
                                                        {cat.gender && (
                                                            <span className="text-[10px] text-gray-500 uppercase">
                                                                {cat.gender === 'MALE' ? 'Masculino' : cat.gender === 'FEMALE' ? 'Femenino' : 'Mixto'}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-black text-[#ccff00]">
                                                        {cat.price > 0 ? `$${cat.price}` : 'Gratis'}
                                                    </span>
                                                </label>
                                            ))}
                                        </div>
                                    </section>

                                    <section className="mb-8">
                                        <label className="flex items-start gap-3 p-4 rounded-2xl bg-white/5 border border-white/10 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={acceptTerms}
                                                onChange={(e) => setAcceptTerms(e.target.checked)}
                                                className="mt-1 w-5 h-5 rounded border-2 border-[#ccff00] text-[#ccff00]"
                                            />
                                            <span className="text-sm text-gray-300">
                                                Acepto los{' '}
                                                <Link href="/terminos-inscripcion" target="_blank" className="text-[#ccff00] font-bold underline">
                                                    Términos y Condiciones de Inscripción
                                                </Link>
                                                , incluida la veracidad del comprobante de pago si aplica.
                                            </span>
                                        </label>
                                    </section>

                                    {error && (
                                        <div className="mb-6 flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20">
                                            <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                                            <p className="text-sm text-red-200">{error}</p>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleSubmit}
                                        disabled={submitting || selectedCategories.size === 0 || !acceptTerms}
                                        className="w-full py-4 rounded-2xl bg-[#ccff00] text-black font-black uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>Inscribirme en {selectedCategories.size} categoría(s)</>
                                        )}
                                    </button>
                                </>
                            )}
                        </>
                    )}
                </main>
            </div>
        </div>
    );
}
