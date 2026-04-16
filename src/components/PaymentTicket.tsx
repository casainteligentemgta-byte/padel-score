'use client';

import { motion } from 'framer-motion';

export type PaymentTicketProps = {
    clubRif?: string | null;
    clubPhone?: string | null;
    clubBank?: string | null;
};

export function PaymentTicket({ clubRif, clubPhone, clubBank }: PaymentTicketProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden rounded-[2rem] bg-zinc-900 border border-white/10 shadow-[0_0_48px_rgba(0,0,0,0.6)]"
        >
            {/* Dotted line decorative */}
            <div className="absolute left-6 right-6 top-6 h-px border-t-2 border-dotted border-[#ccff00]/35" />
            <div className="relative p-6 sm:p-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]/80">Smart Padel</p>
                        <h2 className="mt-1 text-lg sm:text-xl font-black uppercase italic tracking-tighter">Pago Móvil</h2>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/40">Recibo</p>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">Ticket</p>
                    </div>
                </div>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <TicketStat label="Banco" value={clubBank ?? '—'} />
                    <TicketStat label="RIF" value={clubRif ?? '—'} />
                    <TicketStat label="Teléfono" value={clubPhone ?? '—'} />
                </div>

                <div className="mt-5 rounded-2xl border border-white/10 bg-black/30 p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Recomendación</p>
                    <p className="mt-1 text-sm font-bold text-white/80 leading-relaxed">
                        Reporta la referencia tal cual aparece en tu comprobante para que el admin lo valide más rápido.
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

function TicketStat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-white/45">{label}</p>
            <p className="mt-2 text-sm font-black text-[#ccff00] break-all">{value}</p>
        </div>
    );
}

