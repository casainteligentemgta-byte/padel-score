'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { dataService } from '@/lib/dataService';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';
import {
    Receipt, RefreshCw, AlertTriangle, CheckCircle, Clock, X, Eye, DollarSign, User, Trophy, Calendar, Filter
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export default function AdminValidacionPagosPage() {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const router = useRouter();
    const [inscriptions, setInscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedInscription, setSelectedInscription] = useState<any>(null);
    const [filter, setFilter] = useState<'all' | 'pending' | 'paid' | 'alert'>('all');

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

    const handleUpdateStatus = async (id: string, status: 'paid' | 'alert' | 'pending', message: string | null = null) => {
        try {
            const inscription = inscriptions.find(ins => ins.id === id);
            await dataService.updateInscription(id, { paymentStatus: status, alertMessage: message || undefined });
            
            if (status === 'paid' && inscription) {
                try {
                    await dataService.assignPlayersToTournament(
                        inscription.tournamentId, 
                        inscription.categoryKey, 
                        inscription.participantName, 
                        inscription.partnerName
                    );
                } catch (assignError) {
                    console.error('[AssignPlayersError]:', assignError);
                }
            }

            setInscriptions(prev => prev.map(ins => ins.id === id ? { ...ins, paymentStatus: status, alertMessage: message } : ins));
            if (selectedInscription?.id === id) {
                setSelectedInscription({ ...selectedInscription, paymentStatus: status, alertMessage: message });
            }
        } catch (e) {
            console.error(e);
            alert('Error al actualizar el estado.');
        }
    };

    const filteredInscriptions = inscriptions.filter(ins => {
        if (filter === 'all') return true;
        return ins.paymentStatus === filter;
    });

    if (!isAdmin) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white font-outfit relative">
            <Sidebar />

            <div className="pl-20 md:pl-28 pr-4 pt-10 pb-20">
                {/* Header Section */}
                <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-padel-primary/10 rounded-2xl border border-padel-primary/20">
                            <Receipt className="w-8 h-8 text-padel-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black italic uppercase tracking-tighter text-white">
                                Validación de <span className="text-padel-primary">Pagos</span>
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/40">Panel administrativo de tesorería</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                            {(['all', 'pending', 'paid', 'alert'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-white text-black' : 'text-white/40 hover:text-white'
                                        }`}
                                >
                                    {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'paid' ? 'Pagados' : 'Alertas'}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={loadInscriptions}
                            className={`p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all ${loading ? 'animate-spin' : ''}`}
                        >
                            <RefreshCw className="w-4 h-4 text-padel-primary" />
                        </button>
                    </div>
                </header>

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
                        <p className="text-sm text-white/40 max-w-xs mt-2">No se encontraron inscripciones con el filtro seleccionado.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredInscriptions.map((ins) => (
                            <motion.div
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                key={ins.id}
                                className="group relative bg-[#0a0a0a] border border-white/5 rounded-[32px] p-6 hover:border-padel-primary/40 transition-all duration-500 overflow-hidden"
                            >
                                {/* Status Badge */}
                                <div className="absolute top-0 right-0">
                                    <div className={`px-6 py-2 rounded-bl-3xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 ${ins.paymentStatus === 'paid' ? 'bg-emerald-500 text-white' :
                                            ins.paymentStatus === 'alert' ? 'bg-amber-500 text-white' : 'bg-padel-primary text-black'
                                        }`}>
                                        {ins.paymentStatus === 'paid' ? <CheckCircle className="w-3 h-3" /> :
                                            ins.paymentStatus === 'alert' ? <AlertTriangle className="w-3 h-3" /> :
                                                <Clock className="w-3 h-3" />}
                                        {ins.paymentStatus === 'paid' ? 'Pagado' : ins.paymentStatus === 'alert' ? 'Alerta' : 'Pendiente'}
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
                                        </div>
                                    </div>

                                    {ins.alertMessage && (
                                        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2">
                                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                                            <p className="text-[10px] font-medium text-amber-500/80 leading-tight">{ins.alertMessage}</p>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 pt-2">
                                        <button
                                            onClick={() => setSelectedInscription(ins)}
                                            className="grow flex items-center justify-center gap-2 h-10 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-black text-[10px] uppercase tracking-widest"
                                        >
                                            <Eye className="w-4 h-4" /> Revisar Comprobante
                                        </button>
                                        <button
                                            onClick={() => handleUpdateStatus(ins.id, 'paid')}
                                            disabled={ins.paymentStatus === 'paid'}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${ins.paymentStatus === 'paid' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                    'bg-[#ccff00] text-black hover:scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                                }`}
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Inscription Details Modal */}
            <AnimatePresence>
                {selectedInscription && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedInscription(null)}
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
                                        <button onClick={() => setSelectedInscription(null)} className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
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

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-white/30 uppercase tracking-widest pl-2">Acciones Rápidas</p>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(selectedInscription.id, 'paid')}
                                                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 transition-all text-emerald-500 group"
                                                >
                                                    <CheckCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Aprobar</span>
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const msg = prompt('Ingresa el motivo de la alerta:', 'El monto no coincide o la referencia no aparece.');
                                                        if (msg) handleUpdateStatus(selectedInscription.id, 'alert', msg);
                                                    }}
                                                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-3xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-all text-amber-500 group"
                                                >
                                                    <AlertTriangle className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                                    <span className="text-[9px] font-black uppercase tracking-widest">Alerta</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <div className="mt-8">
                                    <button
                                        onClick={() => handleUpdateStatus(selectedInscription.id, 'pending')}
                                        className="w-full h-12 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 hover:text-white transition-all text-[9px] font-black uppercase tracking-[0.2em]"
                                    >
                                        Marcar como Pendiente
                                    </button>
                                </div>
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
