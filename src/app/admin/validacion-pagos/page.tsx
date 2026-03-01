'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService, type InscriptionData } from '@/lib/dataService';
import { extractAmountFromReceipt } from '@/lib/ocrService';
import { validatePaymentAgainstCategoryPrice } from '@/lib/paymentValidation';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';
import {
    Receipt, RefreshCw, AlertTriangle, CheckCircle, Clock, Upload, X, FileText, DollarSign
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminValidacionPagosPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [alerts, setAlerts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [form, setForm] = useState({
        tournamentId: '',
        tournamentName: '',
        categoryKey: '',
        categoryPrice: '',
        participantName: '',
        participantEmail: '',
    });
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [ocrResult, setOcrResult] = useState<{ amount: number | null; loading: boolean }>({ amount: null, loading: false });

    useEffect(() => {
        if (!authLoading && !isAdmin) router.push('/');
    }, [isAdmin, authLoading, router]);

    const loadAlerts = async () => {
        try {
            const list = await dataService.getInscriptionsWithAlerts();
            setAlerts(list);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) loadAlerts();
    }, [isAdmin]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        setReceiptFile(f || null);
        setOcrResult({ amount: null, loading: false });
    };

    const runOcr = async () => {
        if (!receiptFile) return;
        setOcrResult({ amount: null, loading: true });
        try {
            const result = await extractAmountFromReceipt(receiptFile);
            setOcrResult({ amount: result.amountExtracted ?? null, loading: false });
        } catch (e) {
            console.error(e);
            setOcrResult({ amount: null, loading: false });
        }
    };

    const handleSubmit = async () => {
        if (!user?.uid) return;
        const categoryPrice = parseFloat(form.categoryPrice);
        if (isNaN(categoryPrice) || categoryPrice <= 0) {
            alert('Indica un precio de categoría válido.');
            return;
        }
        if (!form.tournamentId.trim()) {
            alert('Indica el ID del torneo.');
            return;
        }

        setUploading(true);
        try {
            let receiptUrl: string | null = null;
            let amountExtracted: number | null = ocrResult.amount;

            if (receiptFile) {
                const storageRef = ref(storage, `receipts/${user.uid}/${Date.now()}_${receiptFile.name}`);
                await uploadBytes(storageRef, receiptFile);
                receiptUrl = await getDownloadURL(storageRef);
                if (amountExtracted == null && ocrResult.loading === false) {
                    const result = await extractAmountFromReceipt(receiptFile);
                    amountExtracted = result.amountExtracted ?? null;
                }
            }

            const validation = validatePaymentAgainstCategoryPrice({
                amountExtracted,
                categoryPrice,
            });

            const data: InscriptionData = {
                tournamentId: form.tournamentId.trim(),
                tournamentName: form.tournamentName.trim() || undefined,
                categoryKey: form.categoryKey.trim() || undefined,
                categoryPrice,
                participantName: form.participantName.trim() || undefined,
                participantEmail: form.participantEmail.trim() || undefined,
                amountExtracted: amountExtracted ?? undefined,
                receiptUrl: receiptUrl ?? undefined,
                paymentStatus: validation.paymentStatus,
                alertMessage: validation.alertMessage ?? undefined,
            };

            await dataService.addInscription(data, user.uid);
            alert(validation.paymentStatus === 'paid'
                ? 'Inscripción registrada y marcada como Pagada (monto coincide con el precio de la categoría).'
                : validation.paymentStatus === 'alert'
                    ? `Inscripción registrada con alerta: ${validation.alertMessage}`
                    : 'Inscripción registrada. Pendiente de comprobante o validación.');
            setShowForm(false);
            setForm({ tournamentId: '', tournamentName: '', categoryKey: '', categoryPrice: '', participantName: '', participantEmail: '' });
            setReceiptFile(null);
            setOcrResult({ amount: null, loading: false });
            loadAlerts();
        } catch (e: any) {
            console.error(e);
            alert(e?.message || 'Error al guardar.');
        } finally {
            setUploading(false);
        }
    };

    const markAsPaid = async (id: string) => {
        try {
            await dataService.updateInscription(id, { paymentStatus: 'paid', alertMessage: null });
            loadAlerts();
        } catch (e) {
            console.error(e);
            alert('Error al actualizar.');
        }
    };

    if (!isAdmin) return null;

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />
            <div className="flex items-center gap-3 mb-6 flex-shrink-0 pl-20 md:pl-24 pr-4 pt-6">
                <BouncingBall size={28} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Validación de pagos</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Monto extraído (OCR) vs precio de categoría</p>
                </div>
            </div>

            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={loadAlerts}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20 text-white text-xs font-bold uppercase tracking-widest hover:bg-white/20"
                        >
                            <RefreshCw className="w-4 h-4" /> Actualizar
                        </button>
                        <button
                            onClick={() => setShowForm(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase tracking-widest hover:bg-padel-primary/90"
                        >
                            <Receipt className="w-4 h-4" /> Nueva inscripción + comprobante
                        </button>
                    </div>

                    <section className="bg-[#111] border border-white/10 rounded-2xl overflow-hidden">
                        <h2 className="p-4 border-b border-white/10 text-sm font-black uppercase tracking-wider text-padel-primary flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4" /> Alertas (monto no coincide con precio de categoría)
                        </h2>
                        {loading ? (
                            <div className="p-12 flex justify-center"><RefreshCw className="w-8 h-8 text-padel-primary animate-spin" /></div>
                        ) : alerts.length === 0 ? (
                            <div className="p-12 text-center text-gray-500 text-sm">No hay alertas. Todas las inscripciones con comprobante coinciden con el precio de la categoría o están pendientes.</div>
                        ) : (
                            <ul className="divide-y divide-white/5">
                                {alerts.map((a: any) => (
                                    <li key={a.id} className="p-4 flex flex-wrap items-center justify-between gap-4">
                                        <div>
                                            <p className="font-bold text-white">{a.participantName || a.participantEmail || 'Sin nombre'}</p>
                                            <p className="text-xs text-gray-500">Torneo: {a.tournamentName || a.tournamentId} · Categoría: {a.categoryKey || '—'}</p>
                                            <p className="text-xs text-amber-400 mt-1">{a.alertMessage}</p>
                                        </div>
                                        <button
                                            onClick={() => markAsPaid(a.id)}
                                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-bold uppercase"
                                        >
                                            <CheckCircle className="w-3.5 h-3.5" /> Marcar como pagada
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </main>

            {showForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                    <div className="w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                        <div className="p-6 border-b border-white/10 flex items-center justify-between">
                            <h3 className="text-lg font-black uppercase italic text-white flex items-center gap-2">
                                <FileText className="w-5 h-5 text-padel-primary" /> Inscripción + comprobante
                            </h3>
                            <button onClick={() => !uploading && setShowForm(false)} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400"><X className="w-4 h-4" /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">ID Torneo</label>
                                <input value={form.tournamentId} onChange={e => setForm(f => ({ ...f, tournamentId: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Ej. abc123" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Nombre torneo (opcional)</label>
                                <input value={form.tournamentName} onChange={e => setForm(f => ({ ...f, tournamentName: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Ej. Open +45" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Categoría</label>
                                    <input value={form.categoryKey} onChange={e => setForm(f => ({ ...f, categoryKey: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Ej. +45" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Precio categoría ($)</label>
                                    <input type="number" step="0.01" value={form.categoryPrice} onChange={e => setForm(f => ({ ...f, categoryPrice: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Participante</label>
                                <input value={form.participantName} onChange={e => setForm(f => ({ ...f, participantName: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="Nombre" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Email (opcional)</label>
                                <input type="email" value={form.participantEmail} onChange={e => setForm(f => ({ ...f, participantEmail: e.target.value }))} className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-sm text-white" placeholder="email@ejemplo.com" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black uppercase text-gray-500 mb-1">Comprobante de pago (imagen)</label>
                                <div className="flex items-center gap-2">
                                    <input type="file" accept="image/*" onChange={handleFileChange} className="flex-1 text-xs text-gray-400 file:mr-2 file:py-2 file:px-3 file:rounded-lg file:bg-padel-primary/20 file:text-padel-primary file:border-0" />
                                    {receiptFile && (
                                        <button type="button" onClick={runOcr} disabled={ocrResult.loading} className="px-3 py-2 rounded-lg bg-padel-primary/20 border border-padel-primary/40 text-padel-primary text-xs font-bold uppercase disabled:opacity-50">
                                            {ocrResult.loading ? 'OCR...' : 'Extraer monto'}
                                        </button>
                                    )}
                                </div>
                                {ocrResult.amount != null && <p className="mt-1 text-xs text-padel-primary flex items-center gap-1"><DollarSign className="w-3 h-3" /> Monto extraído: {ocrResult.amount.toFixed(2)}</p>}
                            </div>
                        </div>
                        <div className="p-6 border-t border-white/10 flex justify-end gap-2">
                            <button onClick={() => !uploading && setShowForm(false)} className="px-4 py-2 rounded-xl bg-white/5 text-gray-400 text-xs font-bold uppercase">Cancelar</button>
                            <button onClick={handleSubmit} disabled={uploading} className="px-4 py-2 rounded-xl bg-padel-primary text-black font-black text-xs uppercase disabled:opacity-50 flex items-center gap-2">
                                <Upload className="w-4 h-4" /> {uploading ? 'Guardando...' : 'Guardar inscripción'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
