'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';
import LegalModal from '@/components/legal/LegalModal';
import { CURRENT_TERMS_VERSION } from '@/lib/legal/termsVersion';

export function TermsReacceptanceOverlay() {
    const { user, refreshProfile } = useAuth();
    const [accepting, setAccepting] = useState(false);
    const uid = user?.uid;

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-start justify-center bg-[#0a0a0a]/80 backdrop-blur-sm px-4 py-6 sm:px-6 sm:py-10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="smart-legal-title"
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <span id="smart-legal-title" className="sr-only">
                    Actualización de términos y condiciones
                </span>
                <LegalModal
                    open
                    onClose={() => {
                        /* obligatorio aceptar: el modal permanece */
                    }}
                    loading={accepting}
                    onAccept={async () => {
                        if (!uid) return;
                        setAccepting(true);
                        try {
                            await dataService.updateProfileLegalAcceptance(uid, {
                                acceptedTermsVersion: CURRENT_TERMS_VERSION,
                                signaturePath: null,
                                biometricPhotoPath: null,
                            });
                            await refreshProfile();
                        } catch (err) {
                            console.error('[TermsOverlay] Error al aceptar términos:', err);
                            alert('No se pudo guardar la aceptación. Reintenta o contacta al club.');
                        } finally {
                            setAccepting(false);
                        }
                    }}
                />
                {accepting && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Guardando…
                    </div>
                )}
            </motion.div>
        </div>
    );
}
