'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { LegalContainer } from '@/components/legal/LegalContainer';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import { Loader2 } from 'lucide-react';

export function TermsReacceptanceOverlay() {
    const { user, refreshProfile } = useAuth();
    const [accepting, setAccepting] = useState(false);
    const uid = user?.uid;

    return (
        <div className="fixed inset-0 z-[9999] flex items-start justify-center bg-[#0a0a0a]/80 backdrop-blur-sm px-4 py-6 sm:px-6 sm:py-10" role="dialog" aria-modal="true" aria-labelledby="smart-legal-title">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl"
            >
                <span id="smart-legal-title" className="sr-only">
                    Actualización de términos y condiciones
                </span>
                <LegalContainer
                    type="inscription"
                    userId={uid}
                    className="max-h-[calc(100dvh-3rem)] sm:max-h-[calc(100dvh-5rem)]"
                    scrollAreaClassName="max-h-none min-h-0"
                    controlsInsideScroll
                    onAccept={async (p) => {
                        if (!uid) return;
                        setAccepting(true);
                        console.log('[TermsOverlay] Aceptando términos...', p.version);
                        try {
                            await dataService.updateProfileLegalAcceptance(uid, {
                                acceptedTermsVersion: p.version,
                                signaturePath: p.signaturePath,
                                biometricPhotoPath: p.biometricPath,
                            });
                            console.log('[TermsOverlay] Guardado en DB exitoso. Refrescando perfil...');
                            await refreshProfile();
                            console.log('[TermsOverlay] Perfil refrescado. Continuando flujo.');
                        } catch (err: any) {
                            console.error('[TermsOverlay] Error en onAccept:', err);
                            const isMissingCol = String(err.message).includes('COLUMNA_FALTANTE');
                            if (isMissingCol) {
                                alert('ATENCIÓN: Se guardó tu firma pero la base de datos no tiene la columna "accepted_terms_version". Por favor, pide al administrador que ejecute la migración 051 en Supabase.');
                            } else {
                                throw err; // Re-throw para que LegalContainer lo muestre
                            }
                        } finally {
                            setAccepting(false);
                        }
                    }}
                />
                {accepting && (
                    <div className="mt-3 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Continuando a la siguiente fase...
                    </div>
                )}
            </motion.div>
        </div>
    );
}
