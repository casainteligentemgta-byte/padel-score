'use client';

import { useState, useEffect } from 'react';
import { dataService } from '@/lib/dataService';
import { Wallet, Info, Copy, CheckCircle2, PhoneCall, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentMethod {
    id: string;
    name: string;
    iban?: string;
    instructions?: string;
    is_active: boolean;
}

export default function PaymentInfo() {
    const [methods, setMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    useEffect(() => {
        async function fetchMethods() {
            try {
                const data = await dataService.getPaymentMethods();
                setMethods(data || []);
            } catch (error) {
                console.error('Error fetching payment methods:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchMethods();
    }, []);

    const handleCopy = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        );
    }

    if (methods.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center backdrop-blur-sm"
            >
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <PhoneCall className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¿Necesitas ayuda con el pago?</h3>
                <p className="text-gray-400 mb-6 max-w-xs mx-auto">
                    No hay métodos de pago automáticos activos en este momento. Por favor, contáctanos directamente para coordinar tu inscripción.
                </p>
                <a
                    href="https://wa.me/584120000000" // Cambiar por el número real si es necesario
                    className="inline-flex items-center gap-2 bg-[#ccff00] text-black font-black px-6 py-3 rounded-xl hover:scale-105 transition-transform"
                >
                    <PhoneCall className="w-5 h-5" />
                    CONTACTAR SOPORTE
                </a>
            </motion.div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-padel-primary/20 flex items-center justify-center">
                    <Wallet className="w-6 h-6 text-padel-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">Información de Pago</h3>
                    <p className="text-white/50 text-xs">Usa estos datos para realizar tu transferencia</p>
                </div>
            </div>

            <div className="grid gap-4">
                {methods.map((method, index) => (
                    <motion.div
                        key={method.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-padel-primary/30 transition-all"
                    >
                        <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-padel-primary bg-padel-primary/10 px-2 py-1 rounded-md mb-2 inline-block">
                                        Método Verificado
                                    </span>
                                    <h4 className="text-lg font-bold text-white">{method.name}</h4>
                                </div>
                                <Info className="w-5 h-5 text-white/20" />
                            </div>

                            {method.iban && (
                                <div className="bg-black/40 rounded-xl p-4 mb-4 border border-white/5 group-hover:border-padel-primary/20 transition-colors">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold mb-1">IBAN / Número de Cuenta</div>
                                    <div className="flex items-center justify-between gap-2">
                                        <code className="text-padel-primary font-mono text-sm break-all">{method.iban}</code>
                                        <button
                                            onClick={() => handleCopy(method.iban!, method.id)}
                                            className="p-2 hover:bg-white/10 rounded-lg transition-colors shrink-0"
                                        >
                                            {copiedId === method.id ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-white/40" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {method.instructions && (
                                <div className="space-y-2">
                                    <div className="text-[10px] text-gray-500 uppercase font-bold px-1">Instrucciones</div>
                                    <div className="text-sm text-gray-300 leading-relaxed bg-white/5 rounded-xl p-4 italic">
                                        {method.instructions}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Decorative gradient */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-padel-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                    </motion.div>
                ))}
            </div>

            <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-start">
                <Info className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-200/70 leading-normal">
                    Una vez realizado el pago, recuerda adjuntar el comprobante en la sección correspondiente para validar tu inscripción.
                </p>
            </div>
        </div>
    );
}
