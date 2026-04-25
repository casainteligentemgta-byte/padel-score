'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import { validatePaymentAgainstCategoryPrice } from '@/lib/paymentValidation';
import { extractAmountFromReceipt } from '@/lib/ocrService';
import { BouncingBall } from '@/components/BouncingBall';
import {
    Receipt, RefreshCw, AlertTriangle, CheckCircle, Clock, X, Eye, DollarSign, User, Trophy, Calendar, Filter,
    Zap, Loader2, Scan, ListChecks, ChevronDown, ChevronUp, MessageCircle, ArrowLeft, Ban, Search, BadgePercent,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuthHeaders } from '@/lib/apiAuth';

type AdminInscriptionStatus = 'pending' | 'paid' | 'alert' | 'exonerado' | 'rechazado' | 'revision';

function getStatusPresentation(status: string | undefined) {
    const s = String(status || 'pending');
    if (s === 'paid') return { label: 'Pagado', wrap: 'bg-emerald-500 text-white', Icon: CheckCircle };
    if (s === 'exonerado') return { label: 'Exonerado', wrap: 'bg-violet-500 text-white', Icon: BadgePercent };
    if (s === 'rechazado') return { label: 'Rechazado', wrap: 'bg-red-600 text-white', Icon: Ban };
    if (s === 'revision') return { label: 'En revisión', wrap: 'bg-sky-600 text-white', Icon: Search };
    if (s === 'alert') return { label: 'Alerta', wrap: 'bg-amber-500 text-white', Icon: AlertTriangle };
    return { label: 'Pendiente', wrap: 'bg-padel-primary text-black', Icon: Clock };
}

export default function AdminValidacionPagosPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [inscriptions, setInscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInscription, setSelectedInscription] = useState<any>(null);
    const [filter, setFilter] = useState<
        'all' | 'pending' | 'paid' | 'alert' | 'exonerado' | 'rechazado' | 'revision'
    >('all');
    const [autoVerifying, setAutoVerifying] = useState(false);
    const [ocrLoading, setOcrLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState<{ amount: number | null; suggestion: 'paid' | 'alert' | 'pending'; message: string } | null>(null);
    const [showReconcile, setShowReconcile] = useState(false);
    const [referencesText, setReferencesText] = useState('');
    /** Búsqueda por referencia del formulario del jugador (no modifica estados de pago). */
    const [refSearchInput, setRefSearchInput] = useState('');
    const [refSearchNorm, setRefSearchNorm] = useState<string | null>(null);
    const [reconcileLoading, setReconcileLoading] = useState(false);
    const [whatsStateByInscription, setWhatsStateByInscription] = useState<Record<string, 'idle' | 'sending' | 'success' | 'error'>>({});
    /** Evita doble envío si el admin hace clic muy rápido antes de que React re-renderice. */
    const whatsSendingRef = useRef<Record<string, boolean>>({});
    const [toastState, setToastState] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const toast = {
        success: (message: string) => setToastState({ type: 'success', message }),
        error: (message: string) => setToastState({ type: 'error', message }),
    };

    useEffect(() => {
        if (!toastState) return;
        const t = window.setTimeout(() => setToastState(null), 3000);
        return () => window.clearTimeout(t);
    }, [toastState]);

    useEffect(() => {
        if (!authLoading && !isAdmin) router.push('/');
    }, [isAdmin, authLoading, router]);

    const loadInscriptions = async () => {
        setLoading(true);
        try {
            const list = await dataService.getAllInscriptions();
            setInscriptions(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) loadInscriptions();
    }, [isAdmin]);

    const [bcvVesPerUsd, setBcvVesPerUsd] = useState<number | null>(null);
    const [bcvError, setBcvError] = useState<string | null>(null);
    useEffect(() => {
        if (!isAdmin) return;
        (async () => {
            try {
                const r = await fetch('/api/fx/bcv');
                const j = await r.json();
                if (j.vesPerUsd && typeof j.vesPerUsd === 'number' && j.vesPerUsd > 0) {
                    setBcvVesPerUsd(j.vesPerUsd);
                    setBcvError(null);
                } else {
                    setBcvVesPerUsd(null);
                    setBcvError(String(j.error || 'tasa no disponible'));
                }
            } catch {
                setBcvVesPerUsd(null);
                setBcvError('red');
            }
        })();
    }, [isAdmin]);

    /**
     * Tras aprobar al menos un pago: 16 “jugadores” (parejas=2) → WhatsApp al CEO y cierre de inscripciones en el JSON del torneo.
     */
    const checkTournamentPlayerCap = async (tournamentId: string | null | undefined) => {
        const tid = String(tournamentId || '').trim();
        if (!tid) return;
        try {
            const r = await fetch('/api/admin/approve-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
                body: JSON.stringify({ tournamentId: tid }),
            });
            const j = (await r.json().catch(() => ({}))) as {
                capReached?: boolean;
                alreadyNotified?: boolean;
                whatsapp?: { sent?: boolean; error?: string };
            };
            if (r.ok && j.capReached && j.whatsapp?.sent) {
                toast.success('Cupo lleno: aviso al CEO y torneo en “inscripciones cerradas”.');
            }
        } catch (e) {
            console.warn('[cupo-torneo]', e);
        }
    };

    const handleUpdateStatus = async (id: string, status: AdminInscriptionStatus, message: string | null = null) => {
        try {
            const inscription = inscriptions.find((ins) => ins.id === id);
            await dataService.updateInscription(id, { paymentStatus: status, alertMessage: message || undefined });

            const roster = status === 'paid' || status === 'exonerado';
            if (roster && inscription) {
                try {
                    await dataService.assignPlayersToTournament(
                        inscription.tournamentId,
                        inscription.categoryKey,
                        inscription.participantName,
                        inscription.partnerName,
                    );
                } catch (assignError) {
                    console.error('[AssignPlayersError]:', assignError);
                }
                await checkTournamentPlayerCap(inscription.tournamentId);
            }

            setInscriptions((prev) => prev.map((ins) => (ins.id === id ? { ...ins, paymentStatus: status, alertMessage: message } : ins)));
            if (selectedInscription?.id === id) {
                setSelectedInscription({ ...selectedInscription, paymentStatus: status, alertMessage: message });
            }
        } catch (e) {
            console.error(e);
            alert('Error al actualizar el estado.');
        }
    };

    /** Acciones con texto opcional (rechazo / exoneración / en revisión). */
    const applyAdminStatus = (id: string, status: AdminInscriptionStatus) => {
        if (status === 'rechazado') {
            const msg = window.prompt('Motivo del rechazo:');
            if (msg === null) return;
            if (!String(msg).trim()) {
                toast.error('Indica un motivo para el rechazo.');
                return;
            }
            void handleUpdateStatus(id, 'rechazado', String(msg).trim());
            return;
        }
        if (status === 'revision') {
            const note = window.prompt('Nota (opcional). Deja vacío para “En revisión”:', 'En revisión');
            if (note === null) return;
            void handleUpdateStatus(id, 'revision', String(note).trim() || 'En revisión');
            return;
        }
        if (status === 'exonerado') {
            const note = window.prompt('Comentario (opcional) para exonerar:', 'Exonerado de pago (tesorería).');
            if (note === null) return;
            void handleUpdateStatus(id, 'exonerado', String(note).trim() || 'Exonerado (admin).');
            return;
        }
        void handleUpdateStatus(id, status, null);
    };

    const normalizeRef = (s: string) => String(s || '').trim().toUpperCase().replace(/\s+/g, '');

    const filteredInscriptions = inscriptions.filter((ins) => {
        if (filter !== 'all' && ins.paymentStatus !== filter) return false;
        if (refSearchNorm) {
            const pr = ins.paymentData?.paymentReference;
            if (pr == null || String(pr).trim() === '') return false;
            const np = normalizeRef(String(pr));
            return (
                np === refSearchNorm ||
                np.includes(refSearchNorm) ||
                refSearchNorm.includes(np)
            );
        }
        return true;
    });

    /** Teléfono para WhatsApp de bienvenida (admin) — misma fuente que la API notify-whatsapp. */
    const getInscriptionWhatsPhone = (ins: any): string =>
        String(
            ins?.paymentData?.phone ??
            ins?.paymentData?.participantPhone ??
            ins?.paymentData?.whatsapp ??
            ins?.paymentData?.telefono ??
            ''
        ).trim();

    const runAutoVerification = async () => {
        const pending = inscriptions.filter(ins => ins.paymentStatus === 'pending');
        if (pending.length === 0) {
            alert('No hay inscripciones pendientes para verificar.');
            return;
        }
        setAutoVerifying(true);
        let updated = 0;
        const tournamentsToCheck = new Set<string>();
        try {
            for (const ins of pending) {
                const amount = ins.paymentData?.paymentAmount != null ? Number(ins.paymentData.paymentAmount) : null;
                const categoryPrice = ins.categoryPrice != null ? Number(ins.categoryPrice) : 0;
                const result = validatePaymentAgainstCategoryPrice({
                    amountExtracted: amount ?? undefined,
                    categoryPrice,
                    bcvVesPerUsd: bcvVesPerUsd != null ? bcvVesPerUsd : undefined,
                });
                if (result.paymentStatus === 'paid') {
                    await dataService.updateInscription(ins.id, { paymentStatus: 'paid', alertMessage: null });
                    try {
                        await dataService.assignPlayersToTournament(
                            ins.tournamentId,
                            ins.categoryKey,
                            ins.participantName,
                            ins.partnerName
                        );
                    } catch {}
                    if (ins.tournamentId) tournamentsToCheck.add(String(ins.tournamentId));
                    updated++;
                } else if (result.paymentStatus === 'alert' && result.alertMessage) {
                    await dataService.updateInscription(ins.id, { paymentStatus: 'alert', alertMessage: result.alertMessage });
                    updated++;
                }
            }
            for (const tid of tournamentsToCheck) {
                await checkTournamentPlayerCap(tid);
            }
            await loadInscriptions();
            if (updated > 0) alert(`Verificación automática: ${updated} inscripción(es) actualizada(s).`);
            else alert('Ninguna inscripción pendiente cumplió el criterio (monto = precio de categoría).');
        } catch (e) {
            console.error(e);
            alert('Error al ejecutar la verificación automática.');
        } finally {
            setAutoVerifying(false);
        }
    };

    const runOcrOnReceipt = async () => {
        if (!selectedInscription?.receiptUrl) return;
        setOcrLoading(true);
        setOcrResult(null);
        try {
            const result = await extractAmountFromReceipt(selectedInscription.receiptUrl);
            const categoryPrice = selectedInscription.categoryPrice != null ? Number(selectedInscription.categoryPrice) : 0;
            const validation = validatePaymentAgainstCategoryPrice({
                amountExtracted: result.amountExtracted ?? undefined,
                categoryPrice,
                bcvVesPerUsd: bcvVesPerUsd != null ? bcvVesPerUsd : undefined,
            });
            setOcrResult({
                amount: result.amountExtracted ?? null,
                suggestion: validation.paymentStatus,
                message:
                    validation.matchNote ||
                    validation.alertMessage ||
                    (validation.paymentStatus === 'paid' ? 'Monto coincide con el precio de la categoría.' : ''),
            });
        } catch (e) {
            console.error(e);
            setOcrResult({ amount: null, suggestion: 'pending', message: 'No se pudo extraer el monto del comprobante.' });
        } finally {
            setOcrLoading(false);
        }
    };

    const applyOcrSuggestion = () => {
        if (!selectedInscription || !ocrResult || ocrResult.suggestion === 'pending') return;
        handleUpdateStatus(selectedInscription.id, ocrResult.suggestion, ocrResult.suggestion === 'alert' ? ocrResult.message : null);
        setOcrResult(null);
    };

    const runReconcileByReferences = async () => {
        const lines = referencesText.split(/\n/).map(l => normalizeRef(l)).filter(Boolean);
        if (lines.length === 0) {
            alert('Pega al menos una referencia (una por línea).');
            return;
        }
        const refSet = new Set(lines);
        const pending = inscriptions.filter(ins => ins.paymentStatus === 'pending');
        const toMark: typeof pending = [];
        for (const ins of pending) {
            const ref = ins.paymentData?.paymentReference;
            if (ref && refSet.has(normalizeRef(ref))) toMark.push(ins);
        }
        if (toMark.length === 0) {
            alert(`Ninguna inscripción pendiente coincide con las ${lines.length} referencia(s) pegada(s). Revisa que la referencia sea la que el jugador ingresó.`);
            return;
        }
        setReconcileLoading(true);
        const tournamentIds = new Set<string>();
        try {
            for (const ins of toMark) {
                await dataService.updateInscription(ins.id, { paymentStatus: 'paid', alertMessage: null });
                try {
                    await dataService.assignPlayersToTournament(
                        ins.tournamentId,
                        ins.categoryKey,
                        ins.participantName,
                        ins.partnerName
                    );
                } catch {}
                if (ins.tournamentId) tournamentIds.add(String(ins.tournamentId));
            }
            for (const tid of tournamentIds) {
                await checkTournamentPlayerCap(tid);
            }
            await loadInscriptions();
            setReferencesText('');
            setShowReconcile(false);
            alert(`Conciliación: ${toMark.length} inscripción(es) marcada(s) como pagada(s).`);
        } catch (e) {
            console.error(e);
            alert('Error al conciliar.');
        } finally {
            setReconcileLoading(false);
        }
    };

    const applyReferenceSearch = () => {
        const q = normalizeRef(refSearchInput);
        if (!q) {
            toast.error('Escribe una referencia para buscar.');
            return;
        }
        setRefSearchNorm(q);
        const n = inscriptions.filter((ins) => {
            if (filter !== 'all' && ins.paymentStatus !== filter) return false;
            const pr = ins.paymentData?.paymentReference;
            if (pr == null || String(pr).trim() === '') return false;
            const np = normalizeRef(String(pr));
            return q === np || np.includes(q) || q.includes(np);
        }).length;
        if (n === 0) {
            toast.error('Ninguna inscripción visible coincide con esa referencia (revisa el filtro de arriba).');
        } else {
            toast.success(`${n} inscripción(es) listada(s) con esa referencia.`);
        }
    };

    const clearReferenceSearch = () => {
        setRefSearchNorm(null);
    };

    /** Envía mensaje de bienvenida al jugador vía Twilio (`sendAdminWelcomeMessage` en servidor). */
    const handleSendAdminWelcomeWhatsApp = async (ins: any) => {
        const id = ins?.id as string;
        if (!id) return;
        if (whatsSendingRef.current[id] || whatsStateByInscription[id] === 'sending') return;

        const phone = getInscriptionWhatsPhone(ins);
        if (!phone) {
            setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'error' }));
            toast.error('No hay teléfono en la inscripción');
            window.setTimeout(() => {
                setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'idle' }));
            }, 2500);
            return;
        }

        whatsSendingRef.current[id] = true;
        setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'sending' }));
        try {
            const res = await fetch('/api/admin/inscriptions/notify-whatsapp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    inscriptionId: id,
                    phone,
                    playerName: ins.participantName || 'Jugador',
                    tournamentName: ins.tournamentName || 'Torneo',
                }),
            });
            if (!res.ok) {
                throw new Error('send failed');
            }
            setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'success' }));
            toast.success('WhatsApp de bienvenida enviado');
            window.setTimeout(() => {
                setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'idle' }));
            }, 3000);
        } catch (e) {
            setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'error' }));
            toast.error('Error al enviar WhatsApp');
            window.setTimeout(() => {
                setWhatsStateByInscription((prev) => ({ ...prev, [id]: 'idle' }));
            }, 3000);
        } finally {
            whatsSendingRef.current[id] = false;
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit relative">
            {/* Barra siempre visible: Atrás (fija bajo el borde del viewport) */}
            <div className="sticky top-0 z-[200] w-full border-b border-padel-primary/20 bg-[#0a0a0a] shadow-lg shadow-black/40">
                <div className="px-3 sm:px-4 md:px-6 py-3 max-w-[1600px] mx-auto flex items-center">
                    <button
                        type="button"
                        onClick={() => router.push('/admin/dashboard')}
                        className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 sm:px-5 rounded-xl bg-padel-primary text-black font-black text-xs sm:text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(204,255,0,0.25)] hover:brightness-110 active:scale-[0.98] transition-all"
                        aria-label="Volver al panel de administración"
                    >
                        <ArrowLeft className="w-5 h-5 sm:w-5 sm:h-5" strokeWidth={2.5} />
                        Atrás
                    </button>
                </div>
            </div>

            <div className="px-4 md:px-8 pt-4 md:pt-8 pb-20 max-w-[1600px] mx-auto">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        <div className="p-2.5 md:p-3 bg-padel-primary/10 rounded-2xl border border-padel-primary/20 shrink-0">
                            <Receipt className="w-6 h-6 md:w-8 md:h-8 text-padel-primary" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white truncate sm:whitespace-normal">
                                Validación de <span className="text-padel-primary">Pagos</span>
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Panel administrativo de tesorería</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex flex-wrap max-w-2xl justify-end gap-1 bg-white/5 p-1 rounded-xl border border-white/5">
                            {(
                                [
                                    ['all', 'Todos'],
                                    ['pending', 'Pend.'],
                                    ['paid', 'Pagados'],
                                    ['exonerado', 'Exon.'],
                                    ['revision', 'Revisión'],
                                    ['rechazado', 'Rech.'],
                                    ['alert', 'Alerta'],
                                ] as const
                            ).map(([f, label]) => (
                                <button
                                    key={f}
                                    type="button"
                                    onClick={() => setFilter(f)}
                                    className={`px-2.5 py-1.5 sm:px-3 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all ${
                                        filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                                    }`}
                                >
                                    {label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={runAutoVerification}
                            disabled={autoVerifying || loading || !inscriptions.some(ins => ins.paymentStatus === 'pending')}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-padel-primary/20 border border-padel-primary/40 hover:bg-padel-primary/30 text-padel-primary transition-all disabled:opacity-50 disabled:pointer-events-none"
                        >
                            {autoVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            <span className="text-[10px] font-black uppercase tracking-widest">Verificación automática</span>
                        </button>
                        <button
                            onClick={() => setShowReconcile(!showReconcile)}
                            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/80 hover:text-white transition-all"
                        >
                            <ListChecks className="w-4 h-4" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Conciliar por referencias</span>
                            {showReconcile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={loadInscriptions}
                            className={`p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all ${loading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-4 h-4 text-padel-primary" />
                        </button>
                    </div>
                </header>
                {bcvVesPerUsd != null ? (
                    <p className="text-[9px] font-bold text-white/45 -mt-4 mb-8 pl-0.5">
                        Tasa BCV aprox. (OCR y verificación auto): <span className="text-padel-primary/90">~{bcvVesPerUsd.toFixed(2)} Bs. / 1 USD</span> — compara
                        monto en bolívares del comprobante con el precio de categoría en USD.
                    </p>
                ) : (
                    <p className="text-[9px] text-amber-500/80 -mt-4 mb-8 pl-0.5">
                        Sin tasa BCV: comparación solo cifra vs cifra. Configura <code className="text-white/50">BCV_VES_PER_USD</code> o revisa red.
                        {bcvError && ` (${bcvError})`}
                    </p>
                )}

                {refSearchNorm && !showReconcile ? (
                    <div className="-mt-2 mb-6 flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-padel-primary/10 border border-padel-primary/25">
                        <p className="text-xs text-white/75">
                            Filtro por referencia:{' '}
                            <code className="text-padel-primary/95 text-[11px] font-mono">{refSearchNorm}</code>
                        </p>
                        <button
                            type="button"
                            onClick={clearReferenceSearch}
                            className="shrink-0 px-3 py-1.5 rounded-lg bg-white/10 border border-white/15 text-[10px] font-black uppercase tracking-widest text-white/90 hover:bg-white/15"
                        >
                            Ver todas
                        </button>
                    </div>
                ) : null}

                {/* Conciliar por referencias (Pago Móvil / transferencias) */}
                {showReconcile && (
                    <div className="mb-8 p-6 rounded-2xl bg-white/5 border border-white/10">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-2">Pago Móvil / Transferencias</p>
                        <div className="mb-4 p-4 rounded-xl bg-black/25 border border-padel-primary/20">
                            <p className="text-[10px] font-black uppercase tracking-widest text-padel-primary/90 mb-1.5">Buscar en el listado</p>
                            <p className="text-xs text-white/55 mb-3">
                                Referencia que el jugador escribió en su formulario de pago. Filtra la cuadrícula debajo; no cambia el estado de pago.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={refSearchInput}
                                    onChange={(e) => setRefSearchInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') applyReferenceSearch();
                                    }}
                                    placeholder="Ej. referencia del formulario del jugador"
                                    className="flex-1 min-w-0 bg-black/40 border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/35 focus:outline-none focus:border-padel-primary/50"
                                />
                                <div className="flex gap-2 shrink-0">
                                    <button
                                        type="button"
                                        onClick={applyReferenceSearch}
                                        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-padel-primary/25 border border-padel-primary/45 text-padel-primary hover:bg-padel-primary/35 transition-all"
                                    >
                                        <Search className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Buscar</span>
                                    </button>
                                    {refSearchNorm ? (
                                        <button
                                            type="button"
                                            onClick={clearReferenceSearch}
                                            className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white/80 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest"
                                        >
                                            Ver todas
                                        </button>
                                    ) : null}
                                </div>
                            </div>
                            {refSearchNorm ? (
                                <p className="text-[11px] text-white/45 mt-2">
                                    Filtro por referencia activo — se combina con el filtro de pestaña (Todos, Pend., etc.).
                                </p>
                            ) : null}
                        </div>
                        <p className="text-sm text-white/70 mb-3">Pega las referencias que ya aparecen en tu banco (una por línea). Se marcarán como pagadas las inscripciones pendientes cuya referencia coincida.</p>
                        <textarea
                            value={referencesText}
                            onChange={e => setReferencesText(e.target.value)}
                            placeholder="Ej.:&#10;REF123456&#10;789012&#10;PM-2024-001"
                            rows={4}
                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-padel-primary/50 resize-y mb-3"
                        />
                        <button
                            onClick={runReconcileByReferences}
                            disabled={reconcileLoading || !referencesText.trim()}
                            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                        >
                            {reconcileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ListChecks className="w-4 h-4" />}
                            Marcar coincidencias como pagadas
                        </button>
                    </div>
                )}

                {/* Grid of Inscriptions */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                        <BouncingBall size={60} />
                        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.5em] text-padel-primary animate-pulse">Sincronizando caja...</p>
                    </div>
                ) : filteredInscriptions.length === 0 ? (
                    <div className="bg-white/5 rounded-3xl border border-white/5 p-20 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
                            <Filter className="w-10 h-10 text-white/20" />
                        </div>
                        <h3 className="text-xl font-bold uppercase italic tracking-tighter">Sin resultados</h3>
                        <p className="text-sm text-white/40 max-w-xs mt-2">
                            {refSearchNorm
                                ? 'Ninguna inscripción cumple el filtro de referencia (o no hay referencia guardada) con el filtro de pestaña actual. Prueba “Ver todas” o otro filtro.'
                                : 'No se encontraron inscripciones con el filtro seleccionado.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredInscriptions.map((ins) => {
                            const sp = getStatusPresentation(ins.paymentStatus);
                            const whatsPhone = getInscriptionWhatsPhone(ins);
                            const whatsBusy = whatsStateByInscription[ins.id] === 'sending';
                            return (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={ins.id}
                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-[32px] p-6 hover:border-padel-primary/40 transition-all duration-500 overflow-hidden"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-0 right-0">
                                    <div
                                        className={`px-5 py-2 rounded-bl-3xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 ${sp.wrap}`}
                                    >
                                        <sp.Icon className="w-3 h-3 shrink-0" />
                                        {sp.label}
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-padel-primary/30 transition-colors">
                                                <User className="w-7 h-7 text-white/20 group-hover:text-padel-primary transition-colors" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-black uppercase italic tracking-tighter leading-none">{ins.participantName || 'Crack Sin Nombre'}</h3>
                                                <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest mt-1">{ins.participantEmail}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-4 border-y border-white/5">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Torneo / Cat</p>
                                            <div className="flex items-center gap-2">
                                                <Trophy className="w-3 h-3 text-padel-primary" />
                                                <p className="text-[10px] font-bold truncate max-w-[120px]">{ins.tournamentName || '—'}</p>
                                            </div>
                                            <p className="text-[9px] font-black text-padel-primary pl-5">{ins.categoryKey || 'Categoría'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-white/30 uppercase tracking-widest">Monto Pagado</p>
                                            <div className="flex items-center gap-2">
                                                <DollarSign className="w-3 h-3 text-emerald-500" />
                                                <p className="text-sm font-black italic">{ins.paymentData?.paymentAmount || '—'}</p>
                                            </div>
                                            <p className="text-[9px] font-bold text-white/40 pl-5">{ins.paymentData?.paymentMethod || '—'}</p>
                                            {ins.paymentData?.paymentReference && (
                                                <p className="text-[9px] font-mono text-padel-primary/90 pl-5 truncate" title={ins.paymentData.paymentReference}>Ref: {ins.paymentData.paymentReference}</p>
                                            )}
                                        </div>
                                    </div>

                                    {ins.alertMessage && (
                                        <div
                                            className={`p-3 rounded-xl flex items-start gap-2 border ${
                                                ins.paymentStatus === 'rechazado'
                                                    ? 'bg-red-500/10 border-red-500/20'
                                                    : ins.paymentStatus === 'revision'
                                                      ? 'bg-sky-500/10 border-sky-500/20'
                                                      : ins.paymentStatus === 'exonerado'
                                                        ? 'bg-violet-500/10 border-violet-500/20'
                                                        : 'bg-amber-500/10 border-amber-500/20'
                                            }`}
                                        >
                                            <AlertTriangle
                                                className={`w-4 h-4 shrink-0 ${
                                                    ins.paymentStatus === 'rechazado'
                                                        ? 'text-red-400'
                                                        : ins.paymentStatus === 'revision'
                                                          ? 'text-sky-400'
                                                          : ins.paymentStatus === 'exonerado'
                                                            ? 'text-violet-400'
                                                            : 'text-amber-500'
                                                }`}
                                            />
                                            <p
                                                className={`text-[10px] font-medium leading-tight ${
                                                    ins.paymentStatus === 'rechazado'
                                                        ? 'text-red-200/90'
                                                        : ins.paymentStatus === 'revision'
                                                          ? 'text-sky-200/90'
                                                          : ins.paymentStatus === 'exonerado'
                                                            ? 'text-violet-200/90'
                                                            : 'text-amber-500/80'
                                                }`}
                                            >
                                                {ins.alertMessage}
                                            </p>
                                        </div>
                                    )}

                                    <div className="flex flex-col gap-2 pt-2">
                                        <div className="flex items-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => { setOcrResult(null); setSelectedInscription(ins); }}
                                                className="min-w-0 grow flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[9px] sm:text-[10px] uppercase tracking-widest"
                                            >
                                                <Eye className="w-4 h-4 shrink-0" /> Revisar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleSendAdminWelcomeWhatsApp(ins)}
                                                disabled={whatsBusy || !whatsPhone}
                                                aria-busy={whatsBusy}
                                                className="w-10 h-10 shrink-0 rounded-xl flex items-center justify-center transition-all border border-emerald-500/35 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 hover:shadow-[0_0_18px_rgba(34,197,94,0.45)] disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed"
                                                title={
                                                    !whatsPhone
                                                        ? 'Sin teléfono en los datos de pago'
                                                        : whatsBusy
                                                          ? 'Enviando…'
                                                          : 'WhatsApp bienvenida (jugador)'
                                                }
                                            >
                                                {whatsBusy ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden />
                                                ) : whatsStateByInscription[ins.id] === 'success' ? (
                                                    <CheckCircle className="w-5 h-5 text-[#22c55e]" aria-hidden />
                                                ) : (
                                                    <MessageCircle className="w-4 h-4" aria-hidden />
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-end gap-1.5">
                                            <button
                                                type="button"
                                                title="Marcar como pagado"
                                                onClick={() => void handleUpdateStatus(ins.id, 'paid', null)}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Exonerado (sin pago, ingresa al torneo)"
                                                onClick={() => applyAdminStatus(ins.id, 'exonerado')}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center border border-violet-500/30 bg-violet-500/15 text-violet-300 hover:bg-violet-500/25"
                                            >
                                                <BadgePercent className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="En revisión"
                                                onClick={() => applyAdminStatus(ins.id, 'revision')}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center border border-sky-500/30 bg-sky-500/15 text-sky-300 hover:bg-sky-500/25"
                                            >
                                                <Search className="w-4 h-4" />
                                            </button>
                                            <button
                                                type="button"
                                                title="Rechazado"
                                                onClick={() => applyAdminStatus(ins.id, 'rechazado')}
                                                className="w-9 h-9 rounded-lg flex items-center justify-center border border-red-500/35 bg-red-500/15 text-red-300 hover:bg-red-500/25"
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                        })}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {toastState && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`fixed top-6 right-6 z-[120] px-4 py-3 rounded-xl border text-xs font-black uppercase tracking-wider ${
                            toastState.type === 'success'
                                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                                : 'bg-red-500/15 border-red-500/30 text-red-300'
                        }`}
                    >
                        {toastState.message}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inscription Details Modal */}
            <AnimatePresence>
                {selectedInscription && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => { setOcrResult(null); setSelectedInscription(null); }}
                            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-5xl bg-[#0a0a0a] border border-white/10 rounded-[40px] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
                        >
                            {/* Left: Preview Image */}
                            <div className="w-full md:w-3/5 bg-black relative flex items-center justify-center h-[40vh] md:h-auto border-b md:border-b-0 md:border-r border-white/5">
                                {selectedInscription.receiptUrl ? (
                                    <img
                                        src={selectedInscription.receiptUrl}
                                        alt="Comprobante"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                ) : (
                                    <div className="flex flex-col items-center gap-4">
                                        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-white/20" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/20">Sin imagen de comprobante</p>
                                    </div>
                                )}
                                <div className="absolute top-4 left-4">
                                    <span className="bg-black/50 backdrop-blur-md text-white text-[9px] font-black uppercase px-4 py-2 rounded-full border border-white/10">
                                        Vista Previa
                                    </span>
                                </div>
                            </div>

                            {/* Right: Info & Actions */}
                            <div className="w-full md:w-2/5 p-8 md:p-12 flex flex-col justify-between overflow-y-auto">
                                <section className="space-y-8">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">
                                                Revisión de <span className="text-padel-primary">Pago</span>
                                            </h2>
                                            <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">ID: {selectedInscription.id.slice(0, 8)}</p>
                                        </div>
                                        <button onClick={() => { setOcrResult(null); setSelectedInscription(null); }} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                            <X className="w-5 h-5 text-white/40" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-4">
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Referencia</p>
                                                <p className="text-sm font-bold text-white">{selectedInscription.paymentData?.paymentReference || '—'}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Fecha</p>
                                                <p className="text-sm font-bold text-white">{selectedInscription.paymentData?.paymentDate || '—'}</p>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Monto</p>
                                                <p className="text-lg font-black text-padel-primary italic">{selectedInscription.paymentData?.paymentAmount || '—'}</p>
                                            </div>
                                            <div className="pt-4 border-t border-white/5 flex flex-col gap-1">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Banco / Origen</p>
                                                <p className="text-xs font-bold text-white">{selectedInscription.paymentData?.paymentBank || '—'}</p>
                                            </div>
                                        </div>

                                        {/* OCR + verificación automática del comprobante */}
                                        {selectedInscription.receiptUrl && (
                                            <div className="p-4 bg-white/5 rounded-2xl border border-white/5 space-y-3">
                                                <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">Verificación por comprobante</p>
                                                <button
                                                    type="button"
                                                    onClick={runOcrOnReceipt}
                                                    disabled={ocrLoading}
                                                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-[10px] font-black uppercase tracking-widest disabled:opacity-50"
                                                >
                                                    {ocrLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Scan className="w-4 h-4" />}
                                                    Extraer monto del comprobante (OCR)
                                                </button>
                                                {ocrResult && (
                                                    <div className="space-y-2 pt-2 border-t border-white/5">
                                                        <p className="text-[10px] text-white/60">
                                                            Monto detectado: <span className="font-bold text-white">{ocrResult.amount != null ? ocrResult.amount.toFixed(2) : '—'}</span>
                                                            {ocrResult.suggestion === 'paid' && ' · Sugerencia: Pagado'}
                                                            {ocrResult.suggestion === 'alert' && ' · Sugerencia: Alerta'}
                                                        </p>
                                                        {ocrResult.message && <p className="text-[9px] text-white/50">{ocrResult.message}</p>}
                                                        {(ocrResult.suggestion === 'paid' || ocrResult.suggestion === 'alert') && (
                                                            <button
                                                                type="button"
                                                                onClick={applyOcrSuggestion}
                                                                className={`w-full py-2 rounded-xl text-[10px] font-black uppercase ${ocrResult.suggestion === 'paid' ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-500 border border-amber-500/30'}`}
                                                            >
                                                                Aplicar sugerencia
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-2">Acciones (tesorería)</p>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => void handleUpdateStatus(selectedInscription.id, 'paid', null)}
                                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-500"
                                                >
                                                    <CheckCircle className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">Pagado</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyAdminStatus(selectedInscription.id, 'exonerado')}
                                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-violet-500/10 border border-violet-500/20 hover:bg-violet-500/20 transition-all text-violet-300"
                                                >
                                                    <BadgePercent className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">Exonerado</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyAdminStatus(selectedInscription.id, 'revision')}
                                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 hover:bg-sky-500/20 transition-all text-sky-200"
                                                >
                                                    <Search className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">En revisión</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => applyAdminStatus(selectedInscription.id, 'rechazado')}
                                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-all text-red-300"
                                                >
                                                    <Ban className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">Rechazado</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const msg = window.prompt('Motivo de la alerta (monto / referencia):', 'El monto no coincide o la referencia no aparece.');
                                                        if (msg) void handleUpdateStatus(selectedInscription.id, 'alert', msg);
                                                    }}
                                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-amber-500"
                                                >
                                                    <AlertTriangle className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">Alerta</span>
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => void handleUpdateStatus(selectedInscription.id, 'pending', null)}
                                                    className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                                                >
                                                    <Clock className="w-5 h-5" />
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-center">Pendiente</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function ImageIcon({ className, ...props }: any) {
    return (
        <svg
            {...props}
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
        </svg>
    );
}
