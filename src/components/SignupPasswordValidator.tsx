'use client';

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, ShieldCheck } from 'lucide-react';
import { SIGNUP_PASSWORD_REQUIREMENTS } from '@/lib/authValidators';

export function SignupPasswordValidator({ password }: { password: string }) {
    const checks = useMemo(
        () => SIGNUP_PASSWORD_REQUIREMENTS.map((req) => ({ ...req, isMet: req.test(password) })),
        [password]
    );
    const score = checks.filter((check) => check.isMet).length;
    const isStrong = score === SIGNUP_PASSWORD_REQUIREMENTS.length;
    const barColor = score <= 2 ? '#ef4444' : score === 3 ? '#fbbf24' : '#ccff00';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="mt-4 p-4 rounded-2xl bg-[#0d0d0d] border border-white/5"
        >
            <div className="flex items-center gap-2.5 mb-3">
                <ShieldCheck className={`w-5 h-5 ${isStrong ? 'text-[#ccff00]' : 'text-zinc-500'}`} />
                <h4 className="text-[11px] font-black uppercase tracking-[0.14em] text-white">Seguridad de tu llave</h4>
            </div>

            <div className="flex gap-1.5 mb-4">
                {SIGNUP_PASSWORD_REQUIREMENTS.map((_, idx) => (
                    <div
                        key={idx}
                        className="h-1.5 flex-1 rounded-full transition-all duration-500"
                        style={{ backgroundColor: idx < score ? barColor : '#1a1a1a' }}
                    />
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-4">
                {checks.map((check, idx) => (
                    <div key={idx} className={`flex items-center gap-2 text-[11px] transition-colors ${check.isMet ? 'text-[#ccff00]' : 'text-gray-600'}`}>
                        <AnimatePresence mode="wait" initial={false}>
                            {check.isMet ? (
                                <motion.span
                                    key="checked"
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.5, opacity: 0 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                    className="inline-flex"
                                >
                                    <CheckCircle2 size={14} className="shrink-0" />
                                </motion.span>
                            ) : (
                                <motion.span key="unchecked" className="inline-flex">
                                    <Circle size={14} className="shrink-0" />
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <span className={check.isMet ? 'font-bold' : ''}>{check.label}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    );
}
