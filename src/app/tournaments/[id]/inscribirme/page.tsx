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
    /** Edad mínima (años cumplidos) para inscribirse en esta categoría. Opcional. */
    ageMin?: number;
    /** Edad máxima (años cumplidos) para inscribirse en esta categoría. Opcional. */
    ageMax?: number;
    /** Cupo máximo de inscritos en esta categoría. Opcional; si no se define, sin límite. */
    maxSlots?: number;
};

/** Calcula la edad en años a partir de una fecha de nacimiento (YYYY-MM-DD o ISO). */
function getAgeFromBirthDate(birthDate: string | null | undefined): number | null {
    if (!birthDate || !birthDate.trim()) return null;
    const d = new Date(birthDate);
    if (Number.isNaN(d.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const m = today.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < d.getDate())) age--;
    return age >= 0 ? age : null;
}

/** Filtra categorías por elegibilidad: sexo y edad del jugador (directrices de inscripción). */
function filterEligibleCategories(
    categories: InscriptionCategoryOption[],
    playerGender: 'MALE' | 'FEMALE' | null | undefined,
    playerAge: number | null
): InscriptionCategoryOption[] {
    return categories.filter((cat) => {
        const genderOk =
            !cat.gender ||
            cat.gender === 'MIXED' ||
            (playerGender != null && cat.gender === playerGender);
        if (!genderOk) return false;
        if (cat.ageMin == null && cat.ageMax == null) return true;
        if (playerAge == null) return false;
        const min = cat.ageMin ?? 0;
        const max = cat.ageMax ?? 999;
        return playerAge >= min && playerAge <= max;
    });
}

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
    const [playerProfile, setPlayerProfile] = useState<{ gender?: 'MALE' | 'FEMALE'; birthDate?: string } | null>(null);
    const [inscriptionCountByCategory, setInscriptionCountByCategory] = useState<Record<string, number>>({});

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
        if (!user?.uid) return;
        let cancelled = false;
        dataService.getMyParticipants(user.uid).then((list) => {
            if (cancelled) return;
            const first = list?.[0];
            if (first) {
                const gender = first.gender === 'MALE' || first.gender === 'FEMALE' ? first.gender : undefined;
                const birthDate = typeof first.birthDate === 'string' ? first.birthDate : undefined;
                setPlayerProfile({ gender, birthDate });
            } else {
                setPlayerProfile(null);
            }
        }).catch(() => {
            if (!cancelled) setPlayerProfile(null);
        });
        return () => { cancelled = true; };
    }, [user?.uid]);

    useEffect(() => {
        if (!tournamentId) return;
        let cancelled = false;
        dataService.getInscriptionsByTournament(tournamentId).then((list) => {
            if (cancelled) return;
            const counts: Record<string, number> = {};
            (list || []).forEach((ins) => {
                const k = ins.categoryKey ?? '';
                counts[k] = (counts[k] ?? 0) + 1;
            });
            setInscriptionCountByCategory(counts);
        }).catch(() => {
            if (!cancelled) setInscriptionCountByCategory({});
        });
        return () => { cancelled = true; };
    }, [tournamentId]);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace('/login?from=inscribirme');
        }
    }, [user, authLoading, router]);

    const categories: InscriptionCategoryOption[] = (Array.isArray(tournament?.inscriptionCategories) && tournament.inscriptionCategories.length > 0)
        ? tournament.inscriptionCategories
        : (tournament ? [{
            key: 'GENERAL',
            name: `${tournament.category || 'Categoría Única'} ${tournament.gender === 'MALE' ? 'Masculino' : tournament.gender === 'FEMALE' ? 'Femenino' : 'Mixto'}`,
            price: 0,
            gender: tournament.gender || undefined,
        }] : []);

    const playerAge = getAgeFromBirthDate(playerProfile?.birthDate);
    const eligibleCategories = filterEligibleCategories(
        categories,
        playerProfile?.gender ?? null,
        playerAge
    );
    const isCategoryFull = (cat: InscriptionCategoryOption) => {
        if (cat.maxSlots == null) return false;
        const count = inscriptionCountByCategory[cat.key] ?? 0;
        return count >= cat.maxSlots;
    };
    const availableCategories = eligibleCategories.filter((cat) => !isCategoryFull(cat));
    const needsProfileForEligibility =
        categories.length > 0 &&
        eligibleCategories.length === 0 &&
        (playerProfile == null || !playerProfile.gender || !playerProfile.birthDate);

    const toggleCategory = (key: string) => {
        const cat = eligibleCategories.find((c) => c.key === key);
        if (cat && isCategoryFull(cat)) return;
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
        const eligibleKeys = new Set(eligibleCategories.map((c) => c.key));
        const invalidKeys = [...selectedCategories].filter((k) => !eligibleKeys.has(k));
        if (invalidKeys.length > 0) {
            setError('Algunas categorías seleccionadas no son válidas para tu perfil (edad o sexo). Desmárcalas e intenta de nuevo.');
            return;
        }
        const fullKeys = eligibleCategories.filter((c) => isCategoryFull(c)).map((c) => c.key);
        const selectedFull = [...selectedCategories].filter((k) => fullKeys.includes(k));
        if (selectedFull.length > 0) {
            setError('Una o más categorías ya están completas. Desmárcalas e intenta de nuevo.');
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
                            ) : needsProfileForEligibility ? (
                                <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-300 text-sm font-bold mb-2">Completa tu ficha de jugador</p>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Para inscribirte, necesitamos tu <strong>sexo</strong> y <strong>fecha de nacimiento</strong>. Así solo verás categorías que correspondan a tu perfil (edad y género).
                                    </p>
                                    <Link href="/players/register?mis-datos=1" className="inline-block px-5 py-3 rounded-2xl bg-[#ccff00] text-black font-black text-sm uppercase">
                                        Ir a Mis datos / Registrar jugador
                                    </Link>
                                    <Link href={`/tournaments/${tournamentId}`} className="block mt-3 text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : eligibleCategories.length === 0 ? (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        No hay categorías disponibles para tu perfil (edad o sexo) en este torneo.
                                    </p>
                                    <Link href={`/tournaments/${tournamentId}`} className="mt-4 inline-block text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : availableCategories.length === 0 ? (
                                <div className="rounded-2xl bg-white/5 border border-white/10 p-8 text-center">
                                    <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                                    <p className="text-gray-400 text-sm">
                                        Todas las categorías disponibles para tu perfil están completas (cupo lleno).
                                    </p>
                                    <Link href={`/tournaments/${tournamentId}`} className="mt-4 inline-block text-[#ccff00] text-sm font-bold">
                                        Volver al torneo
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <section className="mb-8">
                                        <h2 className="text-xs font-black uppercase tracking-widest text-[#ccff00] mb-4">
                                            Elige una o varias categorías (según tu edad y sexo)
                                        </h2>
                                        <p className="text-[10px] text-gray-500 mb-4">
                                            Solo se muestran categorías que corresponden a tu perfil. Puedes inscribirte en varias; el horario evitará choques.
                                        </p>
                                        <div className="space-y-3">
                                            {eligibleCategories.map((cat) => {
                                                const full = isCategoryFull(cat);
                                                const count = inscriptionCountByCategory[cat.key] ?? 0;
                                                const slotsLabel = cat.maxSlots != null ? ` ${count}/${cat.maxSlots} plazas` : '';
                                                return (
                                                    <label
                                                        key={cat.key}
                                                        className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${full ? 'bg-white/5 border-white/5 cursor-not-allowed opacity-70' : 'cursor-pointer'
                                                            } ${selectedCategories.has(cat.key)
                                                                ? 'bg-[#ccff00]/10 border-[#ccff00]/40'
                                                                : !full ? 'bg-white/5 border-white/10 hover:border-white/20' : ''
                                                            }`}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.has(cat.key)}
                                                                onChange={() => toggleCategory(cat.key)}
                                                                disabled={full}
                                                                className="w-5 h-5 rounded border-2 border-[#ccff00] text-[#ccff00] focus:ring-[#ccff00] disabled:opacity-50"
                                                            />
                                                            <span className={`font-bold ${full ? 'text-gray-500' : ''}`}>{cat.name}</span>
                                                            <span className="text-[10px] text-gray-500 uppercase flex items-center gap-1.5">
                                                                {cat.gender && (
                                                                    <span>{cat.gender === 'MALE' ? 'Masc' : cat.gender === 'FEMALE' ? 'Fem' : 'Mixto'}</span>
                                                                )}
                                                                {(cat.ageMin != null || cat.ageMax != null) && (
                                                                    <span>({cat.ageMin ?? '—'}–{cat.ageMax ?? '—'} años)</span>
                                                                )}
                                                                {full && <span className="text-amber-500 font-bold">Completo</span>}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            {slotsLabel && (
                                                                <span className="text-[10px] text-gray-500">{slotsLabel}</span>
                                                            )}
                                                            <span className={`text-sm font-black ${full ? 'text-gray-500' : 'text-[#ccff00]'}`}>
                                                                {cat.price > 0 ? `$${cat.price}` : 'Gratis'}
                                                            </span>
                                                        </div>
                                                    </label>
                                                );
                                            })}
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
