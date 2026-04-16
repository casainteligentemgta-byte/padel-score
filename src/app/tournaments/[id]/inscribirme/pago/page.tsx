'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRouteSegment } from '@/lib/useRouteSegment';
import { useAuth } from '@/lib/AuthContext';
import { useAppSettings } from '@/lib/AppSettingsContext';
import { getAuthHeaders } from '@/lib/apiAuth';
import BouncingBall from '@/components/BouncingBall';
import { PuntitoIA } from '@/components/PuntitoIA';
import { CheckCircle2, Loader2 } from 'lucide-react';

const DEFAULT_PUNTITO_LOGO_DATA_URI =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='44' height='22'><rect width='44' height='22' fill='none'/></svg>";

export default function PagoPage() {
    const tournamentId = useRouteSegment('id');
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();
    const { clubRif, clubBank, clubPhone, clubName } = useAppSettings();

    const [bankOrigin, setBankOrigin] = useState('');
    const [phoneEmitter, setPhoneEmitter] = useState('');
    const [referenceNumber, setReferenceNumber] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        if (!authLoading && !user) {
            router.replace(`/login?from=/tournaments/${tournamentId}/inscribirme/pago`);
        }
    }, [authLoading, user, router, tournamentId]);

    const submitDisabled = processing || success;

    return (
        <div className="relative min-h-dvh bg-[#080808] text-white font-outfit overflow-hidden">
            {authLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#080808]">
                    <BouncingBall size={40} bounceHeight={2} />
                </div>
            )}

            {!authLoading && user && (
                <div className="relative z-10 mx-auto max-w-2xl px-4 py-10 sm:px-6 sm:py-14">
                    <div className="mb-6 flex items-center justify-between gap-3">
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="text-[12px] font-black uppercase tracking-widest text-white/70 hover:text-white"
                        >
                            Atrás
                        </button>
                        <div className="text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80">
                                Smart Padel
                            </p>
                            <h1 className="text-lg sm:text-xl font-black uppercase italic tracking-tighter">
                                Reporte de Pago Móvil
                            </h1>
                        </div>
                        <div className="w-16" aria-hidden />
                    </div>

                    <div className="relative rounded-[2.2rem] border border-[#ccff00]/25 bg-[#050505] shadow-[0_0_40px_rgba(204,255,0,0.10)] overflow-hidden">
                        <div className="pointer-events-none absolute inset-0 opacity-[0.06] bg-gradient-to-br from-[#ccff00] via-transparent to-[#1f2a00]" />

                        <div className="relative p-6 sm:p-8">
                            {processing && (
                                <PuntitoIA
                                    type="inscription"
                                    thinking={true}
                                    idle={true}
                                    message="Procesando tu reporte…"
                                    sponsorConfig={{
                                        bodyColor: 'rgba(0,0,0,0.82)',
                                        logoUrl: DEFAULT_PUNTITO_LOGO_DATA_URI,
                                        eyeColor: '#CCFF00',
                                    }}
                                    className="right-3 top-3"
                                />
                            )}

                            <div className="mb-7 rounded-2xl border border-white/10 bg-black/30 p-4 sm:p-5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80">Datos del club</p>
                                        <p className="mt-1 text-sm font-bold">{clubName || 'Smart Padel'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">RIF</p>
                                        <p className="text-sm font-bold">{clubRif || '—'}</p>
                                    </div>
                                </div>

                                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Banco destino</p>
                                        <p className="text-sm font-bold">{clubBank || '—'}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Teléfono</p>
                                        <p className="text-sm font-bold">{clubPhone || '—'}</p>
                                    </div>
                                </div>
                            </div>

                            {!success ? (
                                <>
                                    <form
                                        onSubmit={async (e) => {
                                            e.preventDefault();
                                            setError(null);

                                            const refDigits = referenceNumber.replace(/\D+/g, '');
                                            if (!/^\d{4,8}$/.test(refDigits)) {
                                                setError('La referencia debe tener 4-8 dígitos.');
                                                return;
                                            }
                                            if (!bankOrigin.trim()) {
                                                setError('Indica el Banco de Origen.');
                                                return;
                                            }
                                            if (!phoneEmitter.trim()) {
                                                setError('Indica el Teléfono emisor.');
                                                return;
                                            }

                                            setProcessing(true);
                                            try {
                                                const headers = await getAuthHeaders();
                                                const res = await fetch(`/api/tournaments/${tournamentId}/inscribirme/pago`, {
                                                    method: 'POST',
                                                    headers: { ...headers, 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({
                                                        bankOrigin: bankOrigin.trim(),
                                                        phoneEmitter: phoneEmitter.trim(),
                                                        referenceNumber: refDigits,
                                                    }),
                                                });

                                                const json = await res.json().catch(() => ({}));
                                                if (!res.ok) {
                                                    setError(json?.error || 'No se pudo enviar el reporte.');
                                                    return;
                                                }
                                                setSuccess(true);
                                            } catch (err: any) {
                                                setError(err?.message || 'Error de red.');
                                            } finally {
                                                setProcessing(false);
                                            }
                                        }}
                                    >
                                        <div className="space-y-5">
                                            <TicketField
                                                label="Banco de Origen"
                                                hint="El banco del emisor (tu banco)."
                                                value={bankOrigin}
                                                onChange={setBankOrigin}
                                                placeholder="Ej.: Banco de Venezuela"
                                            />
                                            <TicketField
                                                label="Teléfono emisor"
                                                hint="Un número para que el club pueda contactarte."
                                                value={phoneEmitter}
                                                onChange={setPhoneEmitter}
                                                placeholder="Ej.: 0412 123 4567"
                                            />
                                            <TicketField
                                                label="Número de Referencia"
                                                hint="4-8 dígitos (tal cual aparece en el comprobante)."
                                                value={referenceNumber}
                                                onChange={setReferenceNumber}
                                                placeholder="Ej.: 123456"
                                                inputMode="numeric"
                                            />

                                            {error && (
                                                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-200 font-bold">
                                                    {error}
                                                </div>
                                            )}

                                            <button
                                                type="submit"
                                                disabled={submitDisabled}
                                                className="w-full rounded-2xl border border-[#ccff00]/30 bg-[#ccff00] text-black font-black uppercase italic tracking-widest py-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_28px_rgba(204,255,0,0.22)]"
                                            >
                                                {processing ? (
                                                    <span className="inline-flex items-center justify-center gap-2">
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Enviando…
                                                    </span>
                                                ) : (
                                                    'Enviar reporte'
                                                )}
                                            </button>

                                            <p className="text-center text-[11px] text-white/50 leading-relaxed">
                                                Tu reporte quedará en <span className="text-[#ccff00] font-black">pending</span> para que el admin lo valide en{' '}
                                                <span className="text-white/70 font-bold">/admin/validacion-pagos</span>.
                                            </p>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                <div className="text-center space-y-4">
                                    <CheckCircle2 className="w-14 h-14 mx-auto text-[#ccff00]" />
                                    <h2 className="text-xl font-black uppercase italic">Reporte enviado</h2>
                                    <p className="text-sm text-white/60">
                                        Quedaste en cola de validación. Revisa tu inscripción cuando el admin apruebe el pago.
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() => router.push(`/tournaments/${tournamentId}/inscribirme`)}
                                        className="mt-2 inline-flex items-center justify-center rounded-2xl bg-[#ccff00] text-black font-black uppercase italic tracking-widest px-6 py-3"
                                    >
                                        Volver a inscribirme
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function TicketField({
    label,
    hint,
    value,
    onChange,
    placeholder,
    inputMode,
}: {
    label: string;
    hint?: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
    return (
        <div>
            <div className="flex items-baseline justify-between gap-3 mb-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-white/50">{label}</label>
                {hint && <span className="text-[10px] text-white/40 font-bold">{hint}</span>}
            </div>
            <input
                type="text"
                inputMode={inputMode}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-white/10 bg-[#0a0a0a] px-5 py-4 outline-none text-white font-bold placeholder:text-white/30 focus:border-[#ccff00]/60 shadow-[0_0_0_rgba(204,255,0,0.0)]"
            />
        </div>
    );
}

