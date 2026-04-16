'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { useAuth } from '@/lib/AuthContext';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { getAuthHeaders } from '@/lib/apiAuth';
import { PaymentTicket } from '@/components/PaymentTicket';
import { VENEZUELAN_BANKS } from '@/lib/venezuelanBanks';
import { PuntitoIA } from '@/components/PuntitoIA';
import { CheckCircle2, Loader2, ReceiptText } from 'lucide-react';

export default function TournamentPaymentReportPage() {
    const tournamentId = useRouteSegment('id');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const appSettings = useAppSettings();

    const clubRif = appSettings.clubRif ?? null;
    const clubPhone = appSettings.clubPhone ?? null;
    const clubBank = appSettings.clubBank ?? null;

    const [bankOrigin, setBankOrigin] = useState('');
    const [phoneEmitter, setPhoneEmitter] = useState('');
    const [amountBs, setAmountBs] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');

    const [processing, setProcessing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [duplicateRef, setDuplicateRef] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace(`/login?from=/tournaments/${tournamentId}/payment`);
        }
    }, [authLoading, user, router, tournamentId]);

    const normalizedReference = useMemo(() => referenceNumber.replace(/\D+/g, ''), [referenceNumber]);

    const canSubmit = useMemo(() => {
        const refOk = /^\d{6,}$/.test(normalizedReference);
        const phoneOk = phoneEmitter.trim().length >= 6;
        const bankOk = bankOrigin.trim().length > 0;
        const amount = Number(amountBs.toString().replace(',', '.'));
        return refOk && phoneOk && bankOk && Number.isFinite(amount) && amount > 0 && !processing;
    }, [normalizedReference, phoneEmitter, bankOrigin, amountBs, processing]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setDuplicateRef(false);
        if (!canSubmit) {
            setError('Revisa los datos del reporte.');
            return;
        }

        setProcessing(true);
        try {
            const headers = await getAuthHeaders();
            const res = await fetch(`/api/tournaments/${tournamentId}/payment`, {
                method: 'POST',
                headers: { ...headers, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    bankOrigin,
                    phoneEmitter,
                    amountBs,
                    referenceNumber: normalizedReference,
                }),
            });

            const json = await res.json().catch(() => ({}));
            if (!res.ok) {
                if (res.status === 409) {
                    setDuplicateRef(true);
                    setError('Referencia ya utilizada');
                    return;
                }
                setError(json?.error || 'No se pudo reportar el pago');
                return;
            }

            setSuccess(true);
        } catch (err: any) {
            setError(err?.message || 'Error de red');
        } finally {
            setProcessing(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-dvh bg-[#080808] flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-[#ccff00] animate-spin" />
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="relative min-h-dvh bg-[#080808] text-white font-outfit overflow-hidden">
            {/* Feedback Puntito (dup ref) */}
            {duplicateRef && (
                <PuntitoIA
                    type="inscription"
                    celebrate={false}
                    thinking={false}
                    xEyes={true}
                    message="Referencia ya utilizada"
                    idle={false}
                    sponsorConfig={{
                        bodyColor: 'rgba(0,0,0,0.82)',
                        logoUrl:
                            "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22'><rect width='44' height='22' fill='none'/></svg>",
                        eyeColor: '#CCFF00',
                    }}
                    className="right-4 top-4"
                />
            )}

            <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-10">
                <div className="flex items-center justify-between mb-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-[12px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                    >
                        Atrás
                    </button>
                    <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80">Smart Padel</p>
                        <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">
                            Reporte de Pago Móvil
                        </h1>
                    </div>
                    <div className="w-10" aria-hidden />
                </div>

                <PaymentTicket clubRif={clubRif} clubPhone={clubPhone} clubBank={clubBank} />

                <div className="mt-6 rounded-[2rem] border border-white/10 bg-zinc-900/40 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-[#ccff00]/10 flex items-center justify-center">
                            <ReceiptText className="w-5 h-5 text-[#ccff00]" />
                        </div>
                        <h2 className="text-[14px] font-black uppercase italic tracking-tight">
                            Reportar comprobante
                        </h2>
                    </div>

                    {success ? (
                        <div className="text-center space-y-4 py-6">
                            <CheckCircle2 className="w-16 h-16 mx-auto text-[#ccff00]" />
                            <h3 className="text-xl font-black uppercase italic">Pago reportado</h3>
                            <p className="text-sm text-white/60">
                                Pago reportado. Puntito está avisando al administrador
                            </p>
                            <button
                                type="button"
                                onClick={() => router.push(`/tournaments/${tournamentId}/inscribirme`)}
                                className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#ccff00] text-black font-black uppercase italic tracking-widest px-6 py-3"
                            >
                                Volver a inscribirme
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                                    Banco Origen
                                </label>
                                <select
                                    value={bankOrigin}
                                    onChange={(e) => setBankOrigin(e.target.value)}
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-4 py-4 outline-none focus:border-[#ccff00]/60"
                                >
                                    <option value="" disabled>
                                        Selecciona tu banco
                                    </option>
                                    {VENEZUELAN_BANKS.map((b) => (
                                        <option key={b.code} value={`${b.code} - ${b.name}`}>
                                            {b.code} - {b.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                                    Teléfono Emisor
                                </label>
                                <input
                                    value={phoneEmitter}
                                    onChange={(e) => setPhoneEmitter(e.target.value)}
                                    placeholder="Ej.: 0412 123 4567"
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-5 py-4 outline-none focus:border-[#ccff00]/60 font-bold"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                                    Monto en Bs
                                </label>
                                <input
                                    value={amountBs}
                                    onChange={(e) => setAmountBs(e.target.value)}
                                    placeholder="Ej.: 250.00"
                                    inputMode="decimal"
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-5 py-4 outline-none focus:border-[#ccff00]/60 font-bold"
                                />
                            </div>

                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-white/50 ml-2">
                                    Número de Referencia
                                </label>
                                <input
                                    value={referenceNumber}
                                    onChange={(e) => setReferenceNumber(e.target.value)}
                                    placeholder="Mínimo 6 dígitos"
                                    inputMode="numeric"
                                    className="mt-2 w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-5 py-4 outline-none focus:border-[#ccff00]/60 font-bold"
                                />
                                <p className="mt-1 text-[10px] text-white/40">
                                    Debe tener mínimo 6 dígitos (se guardan solo números).
                                </p>
                            </div>

                            {error && (
                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 font-bold">
                                    {error}
                                </div>
                            )}

                            <div>
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full rounded-2xl border border-[#ccff00]/30 bg-[#ccff00] text-black font-black uppercase italic tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_28px_rgba(204,255,0,0.22)]"
                                >
                                    {processing ? (
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Enviando…
                                        </span>
                                    ) : (
                                        'Reportar Pago'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

